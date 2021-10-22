
# Changelog

> Note: Every update deletes the MMS media files/folder

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
  about:config
  permissions.default.microphone = 0
  (0=always ask (default), 1=allow, 2=block)
  If it was set to 2, then calling will not work. Change it to 0 and allow on the prompt when you make the call the first time.


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
  - `Expoert` CSV file
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
