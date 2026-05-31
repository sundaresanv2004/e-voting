# Voting Logic Specifications

This document serves as the master specification for the voting logic in the E-Voting application. Because the voting process involves numerous settings, edge cases, and security requirements, we will document the exact logic for each step here before implementing it in code.

## 1. Initial Access Code Validation

When a user enters an access code on the `/auth/vote` page, the system must validate the code and determine the election and category contexts.

### Step 1.1: Resolve Election and Category from Code
The code entered by the user could be either a general Election Code or a specific Category Code.
- **Action**: Query the database for the provided `code` (case-insensitive/uppercase matching depending on schema definition).
  - Check if the `code` matches an `Election.code`. If found:
    - The voter is accessing the **General Election**.
    - Set Context: `Election` = found election, `Category` = `null`.
  - Check if the `code` matches an `ElectionCategory.code`. If found:
    - The voter is accessing a **Specific Category** (e.g., a specific "house" in a school election).
    - Set Context: `Election` = the related election, `Category` = found category.
- **Failure**: If the code matches neither an Election nor an ElectionCategory:
  - Return Error: "Invalid access code. Please check your code and try again."

### Step 1.2: Check Online Voting Settings
Once the election is resolved, we must verify if online voting is permitted.
- **Action**: Check `election.settings.allowOnlineVoting`.
- **Failure**: If `allowOnlineVoting` is `false`:
  - Return Error: "Voting is disabled. Please contact your organization or election administrator."

### Step 1.3: Validate Election Timeframe
The system must ensure the election is currently active based on its scheduled start and end times.
- **Action**: Compare the current time (`now`) against `election.startTime` and `election.endTime`.
- **Failure Cases**:
  - If `now < election.startTime`:
    - Return Error: "Elections vote starts on [Date] at [Time]." (Format the date and time beautifully for the user).
  - If `now > election.endTime`:
    - Return Error: "This election has ended." (Do not show the end date/time, just state it has ended).

---
*(Further logic steps will be added here as we progress through the voting flow implementation.)*
