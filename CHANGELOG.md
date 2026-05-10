# Changelog

## [Unreleased]

## [1.2.0] - 2026-05-10

### Changed
- Migrated from deprecated `terminus-*` to `tabby-*` core packages
- Updated Angular dependencies from 13.x to 15.2.6 to match Tabby v1.0.156
- Updated TypeScript, Webpack, and build tools to latest compatible versions
- Removed deprecated `entryComponents` array (Angular 15+ with Ivy doesn't require this)

### Fixed
- **Security:** Added `.npmrc` with `legacy-peer-deps=true` for compatibility with Tabby's Angular peer dependencies
- Improved module declarations to follow Angular 15+ best practices

### Added
- SECURITY.md with vulnerability disclosure policy
- CHANGELOG.md for version tracking
- Node.js version constraint updated to support future versions (< 26.0.0)

### Dependencies
- `@angular/common`: ^15.2.6 (was ^13.3.2)
- `@angular/core`: ^15.2.6 (was ^13.3.2)
- `@angular/forms`: ^15.2.6 (was ^13.3.2)
- `@ng-bootstrap/ng-bootstrap`: ^14.1.0 (was ^12.0.2)
- `tabby-core`: ^1.0.156 (was terminus-core ^1.0.140)
- `tabby-settings`: ^1.0.156 (was terminus-settings ^1.0.140)
- `tabby-terminal`: ^1.0.156 (was terminus-terminal ^1.0.140)
- `ts-loader`: ^9.5.4 (was ^9.2.8)

## [1.1.6] - Previous releases
- (See upstream repository for earlier versions)
