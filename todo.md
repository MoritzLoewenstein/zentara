# todo first version

- [ ] finish invite functionality
- [ ] docker / docker-compose deployment
- [ ] applications / bookmarks have drag view in non-edit mode? why?

# ideas for later

## ui / ux

- [ ] enable drag & drop between windows (item state contained in drag data, dragEffect copy if not the same dashboard or move if same dashboard)
- [ ] better keyboard navigation
  - [ ] escape to cancel edit mode
  - [ ] enter to submit in edit/add modals
  - [ ] move items with arrow keys?
- [ ] built-in icons for popular applications: how?
- [ ] time based darkmode? or prefers-color-scheme?
- [ ] responsive?
- [ ] settings modal tabs

## code stuff

- [ ] dataurl parser tests
- [ ] dataurl parser extract to own module?

## admin features (im never gonna need these)

- [ ] invite users to own dashboard / share dashboard with invited user
- [ ] multiple dashboards per user?
- [ ] team / user management
- [ ] dashboard view / edit permissions for team / users?

## sqlite backups

### backup mvp

- [ ] export backup button: backup + download + delete after download

### backup overkill

- [ ] scheduled backup
- [ ] backup file list in settings
  - [ ] delete backup file
  - [ ] download backup file
- [ ] restore / setup from backup docs
- [ ] scheduled backup cleanup (max age)
