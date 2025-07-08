# Shadcn Component Manager Registry

[![Components](https://img.shields.io/badge/Components-Community-brightgreen.svg)](https://github.com/Shadcn-Component-Manager/registry)
[![Registry Status](https://img.shields.io/badge/Registry-Active-brightgreen.svg)](https://github.com/Shadcn-Component-Manager/registry)
[![GitHub stars](https://img.shields.io/github/stars/Shadcn-Component-Manager/registry.svg?style=social&label=Star)](https://github.com/Shadcn-Component-Manager/registry)
[![GitHub issues](https://img.shields.io/github/issues/Shadcn-Component-Manager/registry.svg)](https://github.com/Shadcn-Component-Manager/registry/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official Registry for the Shadcn Component Manager (SCM). Central hub for sharing and discovering shadcn/ui components created by the community.

> [!WARNING]
> This registry can currently only be updated via the SCM CLI tool. Direct pull requests to this repository will be denied. Web interface for publishing is coming soon. Use the [CLI tool](https://github.com/Shadcn-Component-Manager/scm) to publish your components.

## Features

- Centralized storage for community-created shadcn/ui components
- Command-line interface for component management
- Auto-generation of new components from existing shadcn/ui components
- Semantic versioning with automatic detection
- GitHub integration for publishing and installation workflows

## Registry Structure

```
registry/
├── registry.json                    # Main registry index (auto-generated)
├── components/                      # Component storage
│   ├── {github-username}/          # User namespace (GitHub username)
│   │   ├── {component-name}/       # Component directory
│   │   │   ├── 1.0.0/             # Version directory (auto-versioned)
│   │   │   │   ├── registry.json  # Component metadata
│   │   │   │   ├── Component.tsx  # Component files
│   │   │   │   └── README.md      # Documentation
│   │   │   └── 2.0.0/             # Newer version
│   │   └── another-component/
│   └── another-user/
└── .github/workflows/              # GitHub Actions for automation
```

## Publishing Components

The SCM CLI package is currently the primary way to publish components to this registry.

### Publish from Existing shadcn/ui compatiable Components

```bash
# Publish your enhanced component
scm publish
```

### Create New Component

```bash
# Install the CLI
npm install -g @shadcn-component-manager/scm

# Authenticate with GitHub
scm login

# Create a new component from scratch
scm create my-awesome-component

# Develop your component
# Edit the generated files, update metadata, test thoroughly

# Publish to registry
scm publish
```

### Workflow

1. Choose base component from existing shadcn/ui or registry components
2. Generate structure using CLI
3. Customize, modify, extend, and enhance the component
4. Validate component structure and files
5. Submit component to the registry

## Installing Components

### Using the CLI

```bash
# Install latest version
scm add username/component-name

# Install specific version
scm add username/component-name@1.0.0

# Search for components
scm search button

# Preview component details
scm preview username/component-name

# List installed components
scm list
```

## Publishing Workflow

1. Component creation using `scm create` for new components or `scm publish` for existing-based components
2. Development and file editing with metadata updates
3. Validation of component structure and files
4. Automatic version detection based on file changes
5. GitHub integration with branch creation and pull request
6. Maintainer review and PR merge
7. Component publication and availability for installation

## Reserved Component Names

Certain component names are reserved to avoid conflicts with shadcn/ui:
- Core UI components: `button`, `card`, `dialog`, `input`, etc.
- Utility components: `utils`, `use-mobile`, etc.
- Theme components: `theme-daylight`, `theme-midnight`, etc.

Use `scm create` or `scm publish` to check name availability.

## Contributing Guidelines

1. Follow shadcn/ui patterns with consistent naming and structure
2. Include comprehensive README.md with usage examples
3. Test thoroughly in different environments
4. Use semantic versioning for version bumps
5. Add categories to help users discover components
6. Leverage existing components using `scm fork`

## Development

### Local Development

```bash
# Clone the registry
git clone https://github.com/Shadcn-Component-Manager/registry.git
cd registry

# Install dependencies (if any)
npm install
```

### GitHub Actions

The registry uses GitHub Actions for:
- Validation of component structure and metadata
- Auto-generation of registry.json from components
- Quality checks to ensure components meet standards

## Troubleshooting

### Common Issues

**Component Not Found**
- Check component exists in the registry
- Verify namespace/name format
- Try refreshing cache: `scm add component --force`

**Publishing Fails**
- Ensure authentication: `scm login`
- Check component validation: `scm publish` shows errors
- Verify GitHub permissions for registry repository

**Installation Issues**
- Check shadcn/ui setup: `npx shadcn@latest init`
- Verify components.json exists and is valid
- Check for dependency conflicts

## License

MIT License - see LICENSE file for details. Individual components retain their original licenses.
