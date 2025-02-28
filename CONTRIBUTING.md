# Contributing to @elizaos/plugin-mbd-farcaster

Thank you for your interest in contributing to the MBD Farcaster plugin for ElizaOS. This document outlines the process and guidelines for contributing to this project.

## Code of Conduct

All contributors are expected to adhere to our Code of Conduct. We are committed to making participation in this project a harassment-free experience for everyone, regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

## How to Contribute

### Reporting Bugs

We use GitHub issues to track bugs. Before submitting a new bug report:

1. Check if the issue has already been reported
2. Use the provided issue template
3. Include detailed steps to reproduce the issue
4. Specify your environment (ElizaOS version, plugin version, etc.)
5. Attach logs if available (enable MBD_DEBUG=true for detailed logs)

### Feature Requests

We welcome feature requests that align with the project's goals. To submit a feature request:

1. Use the provided feature request template
2. Clearly describe the use case and benefits
3. If possible, outline a proposed implementation approach

### Pull Requests

We encourage contributions via pull requests for bug fixes, improvements, and new features:

1. Fork the repository
2. Create a new branch for your changes
3. Follow the coding standards described below
4. Include tests for new functionality
5. Update documentation to reflect changes
6. Submit a pull request with a clear description of your changes

### Development Workflow

1. Set up your development environment:
   ```bash
   git clone https://github.com/developerfred/plugin-mbd-farcaster.git
   cd plugin-mbd-farcaster
   pnpm install
   ```

2. Make your changes and run tests:
   ```bash
   pnpm run lint
   pnpm run test
   ```

3. Build the plugin locally:
   ```bash
   pnpm run build
   ```

4. Test your changes in an ElizaOS environment

## Coding Standards

### Code Style

- Follow TypeScript best practices
- Adhere to the ESLint configuration provided in the repository
- Use meaningful variable and function names
- Write self-documenting code with appropriate comments
- Follow the existing architectural patterns

### Commit Messages

We use conventional commits to streamline the release process:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that do not affect code functionality (formatting, etc.)
- `refactor:` - Code changes that neither fix a bug nor add a feature
- `perf:` - Performance improvements
- `test:` - Adding or modifying tests
- `chore:` - Changes to build process, tooling, etc.

Example: `feat: add semantic search filtering by channel`

### Testing

- Write unit tests for new functionality
- Ensure all existing tests pass
- Consider edge cases and error scenarios
- Include integration tests for API interactions where appropriate

## Documentation

- Update README.md with any new features or changes
- Document new API endpoints, parameters, and response formats
- Provide usage examples for significant features
- Keep code comments up to date

## Review Process

All submissions require review before being merged:

1. Automated checks must pass (CI/CD pipeline)
2. At least one maintainer must approve the changes
3. Address any feedback from code reviews
4. Ensure documentation is up to date

## Release Process

The maintainers follow a scheduled release process:

1. Contributions are collected and reviewed
2. A new version is determined based on semantic versioning
3. Release notes are generated from conventional commits
4. A new package version is published to the registry

## Getting Help

If you need help with your contribution:

- Open a discussion in the GitHub repository
- Reach out to maintainers in the ElizaOS community channels
- Check the existing documentation and examples

## Acknowledgments

Your contributions are appreciated and will be acknowledged in the project's documentation. Significant contributors may be added to the Credits section of the README.

---

By contributing to this project, you agree that your contributions will be licensed under the same license as the main project.