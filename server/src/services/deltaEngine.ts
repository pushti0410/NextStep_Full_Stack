import { SituationVersion, DeltaSummary, PriorityItem } from '../types.js';

export class DeltaEngineService {
  /**
   * Compares Version N-1 and Version N to generate a comprehensive delta summary.
   */
  public computeDelta(prevVer: SituationVersion, currVer: SituationVersion): DeltaSummary {
    const prevResp = prevVer.structuredResponse;
    const currResp = currVer.structuredResponse;

    // 1. Detect Deadline Shift (Scenario 3)
    const deadlineShift = this.detectDeadlineShift(prevVer.rawInput, currVer.rawInput);

    // 2. Detect Priority Shifts & Top Priority Change
    const priorityChanges: string[] = [];
    const prevTop = prevResp.priorities[0];
    const currTop = currResp.priorities[0];

    if (prevTop && currTop) {
      if (prevTop.title.toLowerCase() !== currTop.title.toLowerCase()) {
        let reason = "new constraints were added";
        if (deadlineShift) {
          reason = `the deadline shifted earlier (${deadlineShift.oldVal || 'earlier date'} → ${deadlineShift.newVal || 'new date'})`;
        }
        priorityChanges.push(`Top priority shifted from "${prevTop.title}" to "${currTop.title}" because ${reason}.`);
      } else if (!prevTop.isTied && currTop.isTied) {
        priorityChanges.push(`"${currTop.title}" is now tied with another critical priority of equal urgency.`);
      }
    }

    // 3. Detect New vs Resolved Issues
    const prevIssues = new Set(prevResp.identifiedIssues.map(i => i.toLowerCase()));
    const currIssues = new Set(currResp.identifiedIssues.map(i => i.toLowerCase()));

    const newIssues: string[] = [];
    const resolvedIssues: string[] = [];

    currResp.identifiedIssues.forEach(issue => {
      if (!prevIssues.has(issue.toLowerCase())) {
        newIssues.push(issue);
      }
    });

    prevResp.identifiedIssues.forEach(issue => {
      if (!currIssues.has(issue.toLowerCase())) {
        resolvedIssues.push(issue);
      }
    });

    // 4. Construct Natural Language Delta Summary
    const summaryParts: string[] = [];

    if (deadlineShift) {
      summaryParts.push(`Deadline updated to ${deadlineShift.resolvedVal} (overriding previous mention of ${deadlineShift.oldVal}).`);
    }

    if (priorityChanges.length > 0) {
      summaryParts.push(...priorityChanges);
    } else {
      summaryParts.push("Priorities remain aligned with latest assessment.");
    }

    if (newIssues.length > 0) {
      summaryParts.push(`New issue identified: ${newIssues.join(', ')}.`);
    }

    if (resolvedIssues.length > 0) {
      summaryParts.push(`Resolved issue: ${resolvedIssues.join(', ')}.`);
    }

    return {
      previousVersion: prevVer.version,
      currentVersion: currVer.version,
      deadlineShift,
      priorityChanges,
      newIssues,
      resolvedIssues,
      summaryDelta: summaryParts.join(' ')
    };
  }

  /**
   * Helper to detect conflicting date/day claims in sequential inputs (Scenario 3)
   */
  private detectDeadlineShift(prevInput: string, currInput: string): { oldVal?: string; newVal?: string; resolvedVal?: string } | null {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', '10am', 'tomorrow', 'today'];

    const findDay = (text: string) => {
      const lower = text.toLowerCase();
      for (const day of days) {
        if (lower.includes(day)) {
          return day.charAt(0).toUpperCase() + day.slice(1);
        }
      }
      return null;
    };

    const prevDay = findDay(prevInput);
    const currDay = findDay(currInput);

    if (prevDay && currDay && prevDay !== currDay) {
      return {
        oldVal: prevDay,
        newVal: currDay,
        resolvedVal: currDay // Latest explicit user claim wins per decision rule
      };
    }

    return null;
  }
}

export const deltaEngine = new DeltaEngineService();
