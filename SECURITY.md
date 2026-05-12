# Security Policy

## Vulnerability Reporting

If you discover a security vulnerability in this plugin, please report it by creating a private security advisory on GitHub instead of using the public issue tracker.

## Known Issues

### Dependency Vulnerabilities

This plugin depends on `tabby-core@1.0.156`, which ships Angular 15.2.6. The following high-severity CVEs are inherited from Tabby and **cannot be patched without breaking compatibility**:

- **@angular/core & @angular/common** — XSS vulnerabilities in template binding and sanitization
- **serialize-javascript** — RCE via RegExp.flags (GHSA-5c6j-r48x-rmvq)
- **webpack** — DOM clobbering and SSRF vulnerabilities
- **immutable** — Prototype pollution (GHSA-wf6x-7x77-mvgw)

**Mitigation:**
- These are transitive dependencies through `tabby-core`
- Upgrade only when Tabby v1.0.231+ is released with updated Angular
- Until then, users should keep Tabby updated to receive indirect patches

## Security Fixes

### Version 1.2.0
- Migrated to Tabby core packages (terminology update)
- Removed deprecated Angular features (entryComponents)
- Updated to Angular 15 with latest security patches
- Added Node.js version constraints for compatibility

### Version 1.1.x
- Initial Tabby compatibility
- Command execution improvements
- UI enhancements

## Scope

Security fixes apply only to:
- Plugin code in `src/` and `dist/`
- Command execution and modal UI
- Configuration management

**Not included:**
- Transitive dependencies (defer to Tabby for patching)
- Tabby core or terminal vulnerabilities
- Dependencies' vulnerabilities (except direct bugs in plugin code)
