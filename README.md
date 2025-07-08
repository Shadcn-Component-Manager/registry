# Shadcn Component Manager Registry

This repository contains the community component registry for [Shadcn Component Manager (SCM)](https://github.com/Shadcn-Component-Manager/scm). It serves as the central hub for sharing and discovering shadcn/ui components created by the community.

## Features

- **Component Registry**: Centralized storage for community-created shadcn/ui components
- **CLI Tool**: Command-line interface for component management
- **Auto-Generation**: Generate new components from existing shadcn/ui components
- **Version Management**: Semantic versioning with automatic detection
- **GitHub Integration**: Seamless publishing and installation workflows

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

## How to Contribute Components

### CLI Tool Only

**The SCM CLI package is the primary way to publish components to this registry.**

#### Option 1: Publish from Existing shadcn/ui Components
```bash
# Publish your enhanced component
scm publish
```

#### Option 2: Create New Component
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

### Generation Workflow

1. **Choose Base Component**: Select any existing shadcn/ui component or registry component
2. **Generate Structure**: CLI creates a new component based on the selected base
3. **Customize**: Modify, extend, and enhance the generated component
4. **Validate**: SCM validates component structure and files
5. **Publish**: Submit your component to the registry

## How to Install Components

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

1. **Component Creation**: Use `scm create` for new components or `scm generate` for existing-based components
2. **Development**: Edit files and update metadata
3. **Validation**: SCM validates component structure and files
4. **Version Detection**: Automatic version bump based on file changes
5. **GitHub Integration**: Creates branch and pull request
6. **Review**: Maintainers review and merge the PR
7. **Publication**: Component becomes available for installation

## Reserved Component Names

Certain component names are reserved to avoid conflicts with shadcn/ui:
- Core UI components: `button`, `card`, `dialog`, `input`, etc.
- Utility components: `utils`, `use-mobile`, etc.
- Theme components: `theme-daylight`, `theme-midnight`, etc.

Use `scm create` or `scm generate` to check if your desired name is available.

## Contributing Guidelines

1. **Follow shadcn/ui patterns**: Use consistent naming and structure
2. **Include documentation**: Add comprehensive README.md with usage examples
3. **Test thoroughly**: Ensure components work in different environments
4. **Use semantic versioning**: Follow semver for version bumps
5. **Add categories**: Help users discover your components
6. **Leverage existing components**: Use `scm generate` to build upon existing work

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
- **Validation**: Check component structure and metadata
- **Index Updates**: Auto-generate registry.json from components
- **Quality Checks**: Ensure components meet standards

## Troubleshooting

### Common Issues

**Component Not Found**
- Check the component exists in the registry
- Verify the namespace/name format
- Try refreshing the cache: `scm add component --force`

**Publishing Fails**
- Ensure you're authenticated: `scm login`
- Check component validation: `scm publish` will show errors
- Verify GitHub permissions for the registry repository

**Installation Issues**
- Check shadcn/ui is set up: `npx shadcn@latest init`
- Verify components.json exists and is valid
- Check for dependency conflicts

**Generation Issues**
- Verify the base component exists: `scm search component-name`
- Check component name availability: `scm create --check component-name`
- Ensure proper syntax: `scm generate new-name --from base-component`

## License

This registry is licensed under the MIT License. Individual components retain their original licenses.
