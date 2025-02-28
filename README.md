# @elizaos/plugin-mbd-farcaster

A plugin for ElizaOS that enables integration with the MBD (Mind Blockchain Data) API for Farcaster, providing access to content, analysis, and user discovery on the decentralized social network Farcaster.

## Description

The MBD Farcaster plugin offers access to various MBD API endpoints for Farcaster, featuring resources such as content feeds, semantic search, AI-labeled content analysis, and user discovery.

## Features

- **Content Discovery**: Access to personalized feeds, trends, and popular content
- **Semantic Search**: Advanced search of casts by meaning and context
- **Content Analysis**: Classification of topics, sentiment, emotion, and moderation
- **User Discovery**: Find users by similarity, semantics, channels, topics, and interactions
- **Customization**: Support for content filtering and promotion settings

## Installation

```bash
pnpm install @elizaos/plugin-mbd-farcaster
```

## Configuration

### Optional Environment Variables

```env
# Optional, but recommended to avoid rate limitations
MBD_API_KEY: API key for MBD (Mind Blockchain Data)

# Optional for customization
MBD_APP_NAME: Application name for identification in the MBD API
MBD_APP_URL: Application URL for identification in the MBD API
MBD_DEBUG: Enable debug mode for detailed logging
```

## Usage

### Query Examples

1. Get trending feed:

```typescript
// Get trending casts
"What are the trending casts on Farcaster right now?";
```

2. Semantic search:

```typescript
// Search for content about Web3
"Find posts on Farcaster about blockchain and web3";
```

3. Content analysis:

```typescript
// Analyze sentiment of texts
"Analyze the sentiment of these texts: 'Web3 is transforming finance' and 'NFTs are the future of art'";
```

4. User discovery:

```typescript
// Find similar users
"Find Farcaster users similar to user 12345";
```

## Development

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build the plugin:

```bash
pnpm run build
```

4. Run in development mode:

```bash
pnpm run dev
```

## API Reference

### Main Actions

1. **GET_FARCASTER_FEED**
   - Obtain content feeds (for-you, trending, popular)
   - Parameters: feedType, userId, top_k, filters, etc.

2. **SEARCH_FARCASTER_CASTS**
   - Semantic content search
   - Parameters: query, top_k, return_ai_labels, etc.

3. **ANALYZE_FARCASTER_CONTENT**
   - Content analysis with AI labels
   - Parameters: analysisType, labelCategory, itemsList, textInputs, etc.

4. **DISCOVER_FARCASTER_USERS**
   - User discovery
   - Parameters: discoveryType, userId, query, channel, eventType, etc.

### Label Categories

- **topics**: Classification by topics such as arts, business, technology, etc.
- **sentiment**: Sentiment analysis (positive, neutral, negative)
- **emotion**: Emotion detection such as joy, sadness, anger, etc.
- **moderation**: Identification of problematic content, spam, etc.

## Troubleshooting

### Common Issues

1. **Rate Limits**
   - The MBD API may have rate limits. Consider using an API key to avoid limitations.

2. **Unexpected Results**
   - Verify that parameters are valid and correctly formatted.
   - Enable debug mode (MBD_DEBUG=true) to obtain detailed logs.

3. **API Errors**
   - Check your internet connection
   - Confirm that the MBD API is available and functioning correctly

## Security and Best Practices

### Security

1. **API Credentials**
   - Never expose your MBD_API_KEY in public repositories
   - Use environment variables or secrets sections for sensitive data

2. **Content Filtering**
   - Utilize moderation labels to filter inappropriate content
   - Implement additional validations for sensitive content

### Best Practices

1. **Query Optimization**
   - Use top_k to limit the number of results
   - Leverage available filters to refine results
   - Implement caching for frequent queries

2. **Error Handling**
   - Implement comprehensive error handling
   - Provide meaningful error messages to users

## Contributions

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## Credits

Developed for the ElizaOS ecosystem.

For more information about the MBD API:
- [MBD Documentation](https://docs.mbd.xyz)

## License

This plugin is part of the Eliza project. See the main repository for license information.