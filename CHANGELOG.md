
# Changelog

> Note: Every update deletes the MMS media files and folder which is stored locally in your ephemeral cloud hosted service and not stored in the database.

---
## v0.93 (Jul 14, 2023)
### Security
- stop sending MFA secret to client upon login
  - doing so would allow anyone to generate the TOTP after logging in with user/pass
### Bug Fixes
- fixed chat conversations not appearing (Issue #204)

## v0.92 (Jul 13, 2023)
### Bug Fixes
- fixed a few leading slash issues with a helper function
- fixed socket.io-client import from throwing errors
- fixed build errors

## v0.91 (Jul 11, 2023)
### Feature
- Ability to send PGP Encrypted email notifications of smses received
### Bug Fixes
- fixed a few leading slash issues
- fixed hitting enter on OTP
- fixed path url 404 not found on new registrations
- added example in .env for custom application path for url obscurity purposes

## v0.90 (Jan 2, 2022)
### Feature
- backend sockets implementation for testing the mobile app
### Bug
- attachments file extension fixed

## v0.89 (April 1, 2022)
### Bug
- App would randomly crash with some API pulls, hard to replicate. Added a lot of try/catch statements to contain it.

## v0.88 (March 20, 2022)
### Typo
- Email settings: TO, FROM field labels corrected.

## v0.87 (Feb 16, 2022)
### Bug
- Messages are removed from Twilio's internal logs with an API call. Sometimes it was failing to delete. Now message log deletion waits for confirmation from the API and retries 5 times if one is not received before giving up. Fixes issue #112
- Fixed issue #105 (images in mobile view were saving as .bin)
- Fixed version display
- TOTP toggle asks for confirmation before disabling

## v0.86 (Feb 14, 2022)
### Bug
- Fixed issue with web browser based calling on a Twilio number.

## v0.85 (Feb 12, 2022)
### Feature
- Hardware Key support added. You can add multiple security keys that support U2F (e.g., Yubikey, OnlyKey, Titan, etc).

## v0.84 (Jan 16, 2022)
### Bug
- fixed issue #107, #110, email settings save issue, custom APPDIRECTORY caching issue.

## v0.83 (Jan 12, 2022)
### Bug
- fixed issue 107, email settings save issue.

## v0.82 (Jan 3, 2022)
### Bug
- fixed issue 103, inbound call option stays open even after call hangs up.

## v0.81 (Dec 9, 2021)
### Bug
- Custom APPDIRECTORY route issue fixed

## v0.80 (Nov 24, 2021)
### Security
- Headers refined, directory exposure reduced
- Initial code added for Hardware Keys (function, frontend, library, conditions, db) (final testing remaining for the next release)

### UI
- dial pad colors, alignment adjusted
- Minor bug fixes

- Open Source License added (GPLv3)

## v0.79 (Nov 13, 2021)
### Bugs
- Bug fixes
### Features
- Add dial pad and DTMF tones

## v0.78 (Nov 12, 2021)
### Security
- **MFA - TOTP** QR code (or manual entry) functionality added!
- Few more syntax edits for input sanitization (prevent NOSQL injections)

## v0.77 (Nov 11, 2021)
### UI/Bug
- Added cancel button on attachment window

### Security
- Added Secure Cookie session values
- Trust Proxy
- NOSQL injection protection of functions, input sanitization (100+ syntax edits)
- Secure functions (Math. to crypto.)
- Added compression
- Expose only directories needed, hiding root

## v0.76 (Nov 9, 2021)
### UI
- Text message overflow word break for very long links fixed

## v0.75 (Nov 9, 2021)
### Security
- Protections added as security headers for: XSS, NoSniff, HSTS, X-Powered-By, FrameGuard, DNS Prefetch, Content Security Policy.

### Bugs
- Pull down to refresh now updates the notification dot and the profile inside the dropdown
- Redirect issue to 404 fixed for non-custom directory


## v0.74 (Nov 2, 2021)
- **UI:** Error page update


## v0.73 (Nov 2, 2021)
### Security
- ***Security through Obscurity***: Put in a random directory name in `.env` under `APPDIRECTORY`. Your application will be served only on that subdirectory.
People will not be able to browse to your app page (by discovering your public github page and _deployment_ link)
_Example:_
>|||
>|---|---|
>|APPDIRECTORY|789gh8ag96lgw7ag8fghlkg|
>|||
By default it is not defined. Full instructions [here](https://github.com/0perationPrivacy/voip/wiki/Bonus-Steps).
- ### Bug fix:
  - fixes search bar cursor size on Chromium browsers (Chrome/Brave)
  - Delete account error on empty password fixed
  - SMS reply to shortcode bug fixed. If provider rejects it, you will see their error message.
  - Minor changes in code to function names, variables, comments

- ### UI:
  - Fixed loading bar size and overlapping issues
  - **version** is now viewable under **Settings** and **Login** page (removed from .env)
  - Full message timestamps (M D, Y H:M)
  - On compose message, contacts dropdown now clears after seleting a contact
  




## v0.72 (Oct 30, 2021)
- ***Update ribbon*** shows when there's a newer version available. Links it to the changelog

## v0.71 (Oct 30, 2021)
- Added _plus icon_ for contact not in list
- New **horizontal bar Loader** visible as messages load
- **Fallback URL** added (_redundancy_, can host on 2 servers now with the same login). You will receive the sms/call on both servers.
- Removed error when deleting an already deleted number from Telnyx/Twilio

## v0.70 (Oct 27, 2021)

### Contacts
- Auto sorting contacts alphabetically by first name
- Searching through contacts

### Account Section added
- Change username option added 
- Change password option added
- Delete Account option added (will delete everything)

### Security
- Rate limiter feature added (mitigates brute forcing the app)
- New https variable added (will enable in next update)

### Search
- Search messages
- Search Contacts

### Bugs/Enhancements
- Set min number of phone digits in contacts to 5
- New profile creation switches to that profile now
- API delete icon doesn't show if there's nothing to delete
- Message bar clears when you switch profiles



## v0.69 (Oct 22, 2021)

- Settings
  - **Removed** the Call Settings section
  - Click on the `Settings cog` > `Profile Settings`
  - Click `Get Number` again, select the same number and hit `save`.
  - Clicking save takes a few seconds, in the back end, it configures telnyx or twilio with calling capabilities in multiple places easily saving you 15-20 mins and countless hours of troubleshooting.
  - If calling still doesn't work, click on the delete trash icon under profile settings (this removes settings from telnyx/twilio), and recreate the profile.

## v0.68 (Oct 21, 2021)

- Settings
  - Moved settings from the profile dropdown to its own icon
  - Call settings added (instructions in the Wiki)
  - Email settings added (instructions in the Wiki)

- VoIP Calling
   - Call any number from your desktop browser
   - Receive calls on your number(s) on your desktop browser
   - Call from you mobile phone browser or web app shortcut (can't receive as mobile browsers don't support browser notifications)
   - Call from dialpad (manual entry or contact list dropdown)
   - Call from chat window
   - Call integration with Twilio and Telnyx
   - Firefox instructions to enable browser access to microphone (in the Wiki)

- SMS-to-Email Notifications
   - Configure any SMTP server in the settings
   - Enable notifications per profile with a checkbox
   - _(Coming soon: configure email delay, skip notification if message read within delay)_

- Firefox Setting:
  - about:config
  - permissions.default.microphone = 0
  - (0=always ask (default), 1=allow, 2=block)
  - If it was set to 2, then calling will not work. Change it to 0 and allow on the prompt when you make the call the first time.


## v0.67 (Oct 13, 2021)
- Multiple Bug fixes #58 #45
- Pull down to refresh moved to message list section

## v0.66 (Oct 3, 2021)
- Bug fix: number list refresh in API section
- Pull down to refresh on mobile (on full screen, home screen shortcut)
- Contact names integration in message list (with or without +1)
- Contacts: delete all button
- Contact upload limit (500)

## v0.65.2 (Sept 26, 2021)
- Memory issues/buffer crashes fixed for heroku
- manifest mobile shortcut icons (Progressive Web App look)

## v0.65.1 (Sept 19, 2021)
- Image upload path issue fixed


## v0.65 (Sept 17, 2021)
- Contacts
  - `Add` Manually
  - `Import` CSV file
  - `Export` CSV file
  - `Dropdown` in compose message
- Bug Fix
  - Send empty message error
  - Double click send twice issue (delays till sent confirmation from server received)
  - Sidebar dynamic sizing issue in mid-range (iPad or landscape) view


## v0.64.1 (Sept 13, 2021)
- NULL error issue when sending resolved

## v0.64 (Sept 12, 2021)
- Dark mode `refresh` issue resolved
- `To` Phone number brackets, hyphens now ignored (regex)

## v0.63 (Sept 11, 2021)
- Multiple/`concurrent logins` allowed
- Cookie expiry `30 days`

## v0.62
- `JWT` token implementaiton in `Cookies` instead of LocalStorage
- Security/Vulnerability `patches`

## v0.61
- Dopdown menu `red dot` notification
- fixed login `loop error` for db/session

## v0.60 (Sept 9, 2021)
- MMS `auto delete` function (7 days)
- Added `gif` filetype
- Separate `dev` environment
- Ignore `uploads` folder in commits, deletes on each build
- Fixed uploads folder path
- Scrollable dropdown
- Minor aesthetics

## v0.55 - (Sept 7, 2021)
- Signup bug fix

## v0.50 - (Sept 6, 2021)
- version number added

## v0-0.50 - (Aug, 2021)
- Untracked changes
- Twilio sms auto delete
- Drag/Drop functionality
- MMS
- Empty profiles
- Delete profiles
- Multiple profiles
- Dark/Light Mode
- Twilio integration
- Telnyx integration
- Theme colors
- Basic app development
