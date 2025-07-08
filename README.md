# Shadcn Component Manager Registry

This repository contains the community component registry for [Shadcn Component Manager (SCM)](https://github.com/Shadcn-Component-Manager/scm). It serves as the central hub for sharing and discovering shadcn/ui components created by the community.

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

### Currently: CLI Tool Only

**The SCM CLI package is currently the only way to publish components to this registry.**

1. **Install the CLI**:
   ```bash
   npm install -g @shadcn-component-manager/scm
   ```

2. **Authenticate with GitHub**:
   ```bash
   scm login
   ```

3. **Create a component**:
   ```bash
   scm create my-awesome-component
   ```

4. **Develop your component**:
   - Edit the generated files
   - Update `registry.json` metadata
   - Test your component

5. **Publish to registry**:
   ```bash
   scm publish
   ```

### Coming Soon: Web Interface

We're working on a web interface that will allow you to:
- Browse and search components visually
- Preview components before installing
- Publish components through a web form
- Manage your published components
- View component analytics and usage

The web interface will complement the CLI tool, giving you both command-line and visual options for component management.

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
```

### Manual Installation

You can also manually download components from the raw GitHub URLs:

```
https://raw.githubusercontent.com/Shadcn-Component-Manager/registry/main/components/{username}/{component-name}/{version}/
```

## Component Requirements

### Required Files

Each component must include:

- `registry.json` - Component metadata (required)
- Component files (`.tsx`, `.ts`, `.css`, etc.)

### registry.json Schema

```json
{
  "name": "my-component",
  "type": "registry:component",
  "title": "My Awesome Component",
  "description": "A beautiful component with multiple variants",
  "author": "Your Name <your-email@example.com>",
  "files": [
    {
      "path": "MyComponent.tsx",
      "type": "registry:component"
    }
  ],
  "dependencies": ["react@^18.0.0"],
  "cssVars": {
    "light": {
      "brand": "20 14.3% 4.1%"
    },
    "dark": {
      "brand": "20 14.3% 4.1%"
    }
  }
}
```

## Publishing Workflow

1. **Component Creation**: Use `scm create` to generate component structure
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

Use `scm create` to check if your desired name is available.

## Registry Statistics

- **Storage**: GitHub repository (no external databases)
- **Access**: Public via raw GitHub URLs
- **Versioning**: Semantic versioning with automatic detection
- **Caching**: Local file-based cache in CLI tool
- **Authentication**: GitHub OAuth only
- **No External Dependencies**: Pure GitHub-based system

## Contributing Guidelines

### For Component Authors

1. **Follow shadcn/ui patterns**: Use consistent naming and structure
2. **Include documentation**: Add README.md with usage examples
3. **Test thoroughly**: Ensure components work in different environments
4. **Use semantic versioning**: Follow semver for version bumps
5. **Add categories**: Help users discover your components

### For Registry Maintainers

1. **Review pull requests**: Check component quality and structure
2. **Validate metadata**: Ensure registry.json is complete and valid
3. **Test installations**: Verify components install correctly
4. **Maintain registry index**: Keep registry.json up to date

## Development

### Local Development

```bash
# Clone the registry
git clone https://github.com/Shadcn-Component-Manager/registry.git
cd registry

# Install dependencies (if any)
npm install

# Run validation
npm run validate
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

## License

This registry is licensed under the MIT License. Individual components retain their original licenses.
