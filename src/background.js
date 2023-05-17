const BZ_BUGLIST_URL_BASE = 'https://bugzilla.mozilla.org/buglist.cgi';
const BZ_BUG_URL_BASE = 'https://bugzilla.mozilla.org/show_bug.cgi';
const BZ_LASTORDER_COOKIE = 'LASTORDER';
const JIRA_API_ISSUE_URL_BASE = 'https://mozilla-hub.atlassian.net/rest/api/latest/issue/';

function BZContentScript(params) {
  const BZ_BUG_API_URL_BASE = 'https://bugzilla.mozilla.org/rest/bug/';
  const JIRA_URL_RX = /^https:\/\/mozilla-hub.atlassian.net\/browse\/([A-Z-0-9]+)$/';

  // To be able to sort the same way as the web result, the fields in the order
  // list need to be added to the included fields in the API call.
  const BZ_INCLUDED_FIELDS = [
    'id',
    'see_also',
  ];
  const ORDER_LIST = params.lastOrder ? decodeURIComponent(params.lastOrder).replaceAll('bug_', '').split(',') : [];
  const BZ_FIELDS = new Set([ ...BZ_INCLUDED_FIELDS, ...ORDER_LIST]);

  function getBugId(url) {
    // Get the bug id from the URL
    const bugURL = new URL(url);
    const bugParams = bugURL.searchParams;
    return bugParams.get('id');
  }

  function getBuglistRestURL() {
    const queryLinks = document.querySelectorAll('.bz_query_links a');
    if (queryLinks.length && queryLinks[0].textContent === 'REST') {
      return queryLinks[0].href;
    }
  }

  function getBuglistApiURL() {
    const apiURL = new URL(getBuglistRestURL());
    const apiParams = apiURL.searchParams;

    // Override include_fields to add see_also so we can infer Jira Links.
    apiParams.set('include_fields', [ ...BZ_FIELDS ].join(','));

    // Check the limit of the current page and make sure the API call matches.
    const pageURL = new URL(window.location);
    const pageParams = pageURL.searchParams;
    const pageLimit = pageParams.get('limit');
    apiParams.set('limit', pageLimit !== null && pageLimit >= 0 ? pageLimit : 500);

    // This value was passed to the content script having been looked up
    // from the LASTORDER cookie.
    apiParams.set('order', decodeURIComponent(params.lastOrder));

    return apiURL;
  }

  function extractJIRALinkFromSeeAlso (links) {
    for (let link of links) {
      const matches = link.match(JIRA_URL_RX)
      if (matches) {
        return {
          href: matches[0],
          text: matches[1],
        }
      }
    }
  }

  async function fetchBZData(url) {
    const result = await fetch(url)
    return await result.json();
  }

  async function initBuglist() {
    if (document.getElementById('bz-jira-table-header')) {
      return;
    }
    // Prospectively create the column since to minimize jank.
    const header = document.createElement('th');
    header.id = 'bz-jira-table-header';
    const headerText = header.textContent = 'Jira Link';
    // This should be enough width to allow for a JIRA link code of
    // XXXXXX-XXX so that the page doesn't move around when the data has loaded.
    header.style.minWidth = '7.5em';
    document.querySelector('table.bz_buglist thead tr').appendChild(header);

    // Now fetch the extra data needed to understand if the bug in the row has a jira link.
    const response = await fetchBZData(getBuglistApiURL());

    // iterate over the bugslist and grab the JIRA URL if it matches.
    let bugsNotFoundCount = 0;
    for (let result of response.bugs) {
      const bugRow = document.getElementById(`b${result.id}`);

      if (bugRow) {
        const jiraLink = extractJIRALinkFromSeeAlso(result.see_also));
        let cell = document.createElement('td');
        if (jiraLink) {
          let newLink = document.createElement('a');
          newLink.target = '_blank';
          newLink.href = jiraLink.href;
          newLink.textContent = jiraLink.text;
          cell.appendChild(newLink);
        }
        // Even if there's no JiraLink we'll want to add a td
        bugRow.appendChild(cell);
      } else {
        bugsNotFoundCount++;
      }
    }
    console.warn(`${bugsNotFoundCount} bugs not found in the bug list table`);
  }

  async function initBug() {
    const bugId = getBugId(window.location);
    const bugApiURL = new URL(`${BZ_BUG_API_URL_BASE}${bugId}`);
    bugApiURL.searchParams.set('include_fields', BZ_INCLUDED_FIELDS);

    const bzAPIData = await fetch(bugApiURL);
    const bugJSON = await bzAPIData.json();
    const bugData = bugJSON?.bugs[0];
    const jiraIssueData = extractJIRALinkFromSeeAlso(bugData.see_also);

    if (jiraIssueData) {
      const bugLink = document.getElementById('field-value-bug_id');
      const jiraSpan = document.createElement('span');
      const jiraLink = document.createElement('a');
      jiraLink.href = jiraIssueData.href;
      jiraLink.target = '_blank';
      jiraSpan.textContent = ', JIRA: ';
      jiraLink.textContent = jiraIssueData.text;
      jiraSpan.appendChild(jiraLink);
      bugLink.parentNode.insertBefore(jiraSpan, bugLink.nextSibling);
    }

    return {
      jiraIssueID: jiraIssueData?.text,
      bugApiURL: bugApiURL.toString(),
      bugId,
    }
  }

  if (window.location.href.startsWith(params.BZ_BUGLIST_URL_BASE)) {
    initBuglist();
  }

  if (window.location.href.startsWith(params.BZ_BUG_URL_BASE)) {
    return initBug();
  }
}


export function executeGetRestURL(tabId, func, args) {
  return browser.scripting.executeScript({
    func,
    args,
    target: {
      tabId,
    },
  });
}


class BzJira {
  constructor () {
    this.bugApiURL = null;
    this.jiraIssueID = null;
    this.bugId = null;
  }

  handleTabUpdates = async (tabId, changeInfo) => {
    if (changeInfo.url && (changeInfo.url.startsWith(BZ_BUGLIST_URL_BASE) || changeInfo.url.startsWith(BZ_BUG_URL_BASE))) {
      // Only Apply to buglists.
      if (changeInfo.url.startsWith(BZ_BUGLIST_URL_BASE)) {
        browser.pageAction.hide(tabId);
      }

      // This cookie contains info on the last order used in bugzilla.
      const lastOrder = await browser.cookies.get({
        url: changeInfo.url,
        name: BZ_LASTORDER_COOKIE,
      });

      // Params to pass to the content script.
      const args = [{
        lastOrder: lastOrder.value,
        BZ_BUGLIST_URL_BASE,
        BZ_BUG_URL_BASE,
      }];

      const scriptResponse = await executeGetRestURL(tabId, BZContentScript, args);

      // Store the results on the class when provided.
      if (scriptResponse.length && scriptResponse[0].result) {
        const { jiraIssueID, bugApiURL, bugId } = scriptResponse[0].result;
        this.jiraIssueID = jiraIssueID;
        this.bugApiURL = bugApiURL;
        this.bugId = bugId;
      }

      // Only Apply to bug pages
      if (changeInfo.url.startsWith(BZ_BUG_URL_BASE)) {
        browser.pageAction.show(tabId);
      }
    }
  }

  getComparisonData = async () => {
    // Customize fields for BZ
    const bzBugApiURL = new URL(this.bugApiURL);
    bzBugApiURL.searchParams.set('include_fields', ['id,summary,assigned_to,priority,status,cf_fx_points']);

    // Customize Fields for JIRA
    const jiraApiURL = new URL(`${JIRA_API_ISSUE_URL_BASE}${this.jiraIssueID}`);
    jiraApiURL.searchParams.set('fields', ['summary,assignee,priority,status,customfield_10037']);

    if (this.jiraIssueID) {

      const [jiraAPIData, bzData] = await Promise.all([fetch(jiraApiURL), fetch(bzBugApiURL)]);

      let JIRAData;
      let bugData;

      if (jiraAPIData.ok) {
        JIRAData = await jiraAPIData.json();
      } else {
        const jiraResponseStatus = jiraAPIData.status;
        let loggedInMessage;
        if (jiraResponseStatus === 404) {
          loggedInMessage = ` Make sure you're logged into JIRA! 😉`;
        }
        const jiraErrorMsg = `JIRA API request failed with ${jiraResponseStatus}.${loggedInMessage}`;
        throw new Error(jiraErrorMsg);
      }

      if (bzData.ok) {
        const bzDataJSON = await bzData.json();
        bugData = bzDataJSON.bugs[0];
      } else {
        throw new Error(`Bugzilla API request failed with error status ${bzData.status}.`);
      }

      const comparisonData = {
        title: {
          jira: JIRAData.fields.summary,
          bz: bugData.summary
        },
        assignee: {
          jira: JIRAData.fields.assignee,
          bz: bugData.assigned_to
        },
        status: {
          jira: JIRAData.fields.status.name.replace(' (migrated)', ''),
          bz: bugData.status
        },
        priority: {
          jira: JIRAData.fields.priority.name,
          bz: bugData.priority
        },
        points: {
          jira: JIRAData.fields.customfield_10037,
          bz: bugData.cf_fx_points
        },
      };
      return { comparisonData, bugId: this.bugId, jiraIssueID: this.jiraIssueID };
    }
  }

  handleMessage = async (request,sender,sendResponse) => {
    let that = this;
    if (request.greeting === "getComparisonData" && sender.id === 'jira-bz@mozilla.com') {
      return new Promise(async (resolve) => {
        let result = { errorTitle: 'No Linked JIRA Issue', error: 'No JIRA Issue has been linked to this bug yet!' };
        if (that.jiraIssueID) {
          try {
            console.log('wat');
            result = await that.getComparisonData();
          } catch (e) {
            result = { errorTitle: 'API Error', error: e.message };
          }
        }
        resolve(result);
      });
      return true;
    }
  }
}

export async function initEvents() {
  const BzJiraInst = new BzJira();
  browser.tabs.onUpdated.addListener(BzJiraInst.handleTabUpdates);
  browser.runtime.onMessage.addListener(BzJiraInst.handleMessage);
}

initEvents();
