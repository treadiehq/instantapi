# Publishing to npm

Guide for publishing `@instantapihq/cli` and `@instantapihq/sdk` to npm.

## Prerequisites

1. **npm account**: Sign up at https://npmjs.com
2. **npm login**: Run `npm login` and enter your credentials
3. **Org access**: Make sure you're added to the `@instantapihq` org on npm

## One-Time Setup

### 1. Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### 2. Verify Access

```bash
npm org ls instantapihq
```

You should see yourself listed. If not, the org owner needs to add you.

## Publishing Packages

### Publish CLI

```bash
cd cli

# Build the package
npm run build

# Test the package locally (optional)
npm link
instant-api --version
npm unlink

# Publish to npm
npm publish --access public

# Done! ✅
```

### Publish SDK

```bash
cd packages/sdk

# Build the package
npm run build

# Test the package locally (optional)
npm link
cd ../../cli
npm link @instantapihq/sdk

# Publish to npm
cd ../packages/sdk
npm publish --access public

# Done! ✅
```

## Updating Versions

When publishing updates, follow semantic versioning:

```bash
# Patch (bug fixes): 1.0.0 → 1.0.1
npm version patch

# Minor (new features): 1.0.0 → 1.1.0
npm version minor

# Major (breaking changes): 1.0.0 → 2.0.0
npm version major

# Then publish
npm publish --access public
```

## After Publishing

### 1. Update Documentation

Update any references in README files from `@instantapi/*` to `@instantapihq/*`:

```bash
# Main README
# CLI README
# SDK README
```

### 2. Test Installation

```bash
# Test CLI installation
npx @instantapihq/cli --version

# Test SDK installation
npm install @instantapihq/sdk
```

### 3. Verify on npm

- CLI: https://www.npmjs.com/package/@instantapihq/cli
- SDK: https://www.npmjs.com/package/@instantapihq/sdk

## Publishing Checklist

Before each publish:

- [ ] Update version number in `package.json`
- [ ] Update `CHANGELOG.md` (if you have one)
- [ ] Run `npm run build` successfully
- [ ] Test locally with `npm link`
- [ ] Commit and push changes to GitHub
- [ ] Tag the release in git: `git tag v1.0.0 && git push --tags`
- [ ] Publish to npm: `npm publish --access public`
- [ ] Verify on npmjs.com
- [ ] Test installation: `npx @instantapihq/cli --version`

## Troubleshooting

**"You do not have permission to publish":**
- Make sure you're logged in: `npm whoami`
- Check org membership: `npm org ls instantapihq`
- Ensure the package is scoped: `@instantapihq/package-name`
- Use `--access public` flag

**"Package already exists":**
- Someone else published it first
- Increment version number

**"Invalid package name":**
- Make sure name is `@instantapihq/cli` or `@instantapihq/sdk`
- No spaces or special characters

## Package URLs

After publishing, your packages will be available at:

- **CLI**: https://www.npmjs.com/package/@instantapihq/cli
- **SDK**: https://www.npmjs.com/package/@instantapihq/sdk

Installation:

```bash
# CLI (global)
npm install -g @instantapihq/cli

# SDK (project dependency)
npm install @instantapihq/sdk

# Or use with npx
npx @instantapihq/cli expose http://localhost:3000
```

