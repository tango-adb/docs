# Documentation Formatting Rules

This document outlines the formatting rules and guidelines for maintaining consistent documentation across the Tango ADB project. This document follows the same formatting rules it describes.

## Precondition: Document Structure

- Use proper Docusaurus MDX formatting with frontmatter metadata (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx`)
- Use `---` frontmatter for metadata (Example: `@tango-adb/docs/docs/scrcpy/options/angle.mdx`)
- Include import statements at the top of pages when referencing custom components (e.g., `import Version from "../version-span";`). Only include the import if you actually use the component in the file. (Example: `@tango-adb/docs/docs/scrcpy/options/audio-codec.mdx` has the import and uses it, while `@tango-adb/docs/docs/scrcpy/options/vd-destroy-content.mdx` does not have the import since it's not used)
- Use appropriate heading levels (h1, h2, h3, h4) to maintain document hierarchy (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)
- Start with an H1 heading (using `#`) that describes the API or executable (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)

## General Formatting

- Use proper Docusaurus MDX formatting with frontmatter metadata (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx`)
- Use appropriate heading levels (h1, h2, h3, h4) to maintain document hierarchy (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)
- Separate major sections with blank lines for readability (Example: `@tango-adb/docs/docs/scrcpy/options/max-size.mdx`)
- Add adequate line breaks between major sections (Example: `@tango-adb/docs/docs/scrcpy/options/power-off-on-close.mdx`)
- Separate code blocks from prose with blank lines (Example: `@tango-adb/docs/docs/scrcpy/options/video-codec.mdx`)
- Use blank lines around info boxes for visual separation (Example: `@tango-adb/docs/docs/scrcpy/options/log-level.mdx`)
- Maintain consistent spacing throughout documents (Example: `@tango-adb/docs/docs/scrcpy/options/audio.mdx`)
- Add one empty line before and after lists (either ordered and unordered), but not any empty lines between list items (Example: `@tango-adb/docs/docs/scrcpy/options/crop.mdx`)
- Empty line rules (specifically for spacing around headers and code blocks):
  - No more than 1 consecutive empty line anywhere in the document (no more than 2 line break characters `\n`)
  - Exactly 1 empty line before and after each header (`#`, `##`, etc.) and code block (```)
  - No empty lines at the beginning and end inside code blocks (```)
  - One empty line is sufficient if a header/code block is immediately after another header/code block
- Prefer short paragraphs (Example: `@tango-adb/docs/docs/scrcpy/options/bit-rate.mdx`)
- Use `---` frontmatter for metadata (Example: `@tango-adb/docs/docs/scrcpy/options/angle.mdx`)
- Include import statements at the top of pages when referencing custom components (e.g., `import Version from "../version-span";`). Only include the import if you actually use the component in the file. (Example: `@tango-adb/docs/docs/scrcpy/options/audio-codec.mdx` has the import and uses it, while `@tango-adb/docs/docs/scrcpy/options/vd-destroy-content.mdx` does not have the import since it's not used)
- Always use Markdown code spans for type names, method names, and similar technical terms (Example: `@tango-adb/docs/docs/scrcpy/options/codec-options.mdx`)
- Do not run Prettier on MDX files as it incorrectly adds line breaks inside React components (like `<Version>` tags), which causes unwanted spacing in the rendered output (Example: `@tango-adb/docs/docs/scrcpy/options/list-apps.mdx`)

## Frontmatter & Navigation

- Include `sidebar_position` in frontmatter for proper navigation ordering (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx` has `sidebar_position: 49`)
- `index.mdx` files do not include `sidebar_position` in frontmatter as their order is determined by `position` in the parent `_category_.yml` file (Example: `@tango-adb/docs/docs/scrcpy/options/index.mdx`)
- Use `_category_.yml` files to configure sidebar navigation (Example: `@tango-adb/docs/docs/scrcpy/_category_.yml`)
- Include `position` property to control ordering in sidebar (Example: `@tango-adb/docs/docs/scrcpy/_category_.yml`)
- Use `label` property for the display name in sidebar (Example: `@tango-adb/docs/docs/scrcpy/_category_.yml`)
- All `_category_.yml` files must include the `label` property to define the display name in the sidebar (Example: `@tango-adb/docs/docs/scrcpy/options/_category_.yml`)
- Set `collapsed: false` to show sub-items expanded by default (Example: `@tango-adb/docs/docs/scrcpy/_category_.yml`)
- For scrcpy options, order by: foundational concepts first (like `ScrcpyOptionValue`), then options by version added and by order in source code, with advanced topics (like `Inheritance`) at the bottom (Example: `@tango-adb/docs/docs/scrcpy/options/index.mdx`)
- When adding new options, assign a `sidebar_position` that reflects the chronological order of when the feature was added in Scrcpy versions (e.g., options added in v1.17-v1.25 should have positions between early 1.x options and 2.x options) (Example: `@tango-adb/docs/docs/scrcpy/options/vd-destroy-content.mdx` has `sidebar_position: 125` for v3.1 feature)
- Ensure `sidebar_position` values are unique to avoid conflicts; check existing positions before assigning a new one (Example: `@tango-adb/docs/docs/scrcpy/options/angle.mdx` has `sidebar_position: 47`)
- Position values should increase incrementally based on the version timeline to maintain logical ordering in the sidebar (Example: compare `@tango-adb/docs/docs/scrcpy/options/power-off-on-close.mdx` with `sidebar_position: 23` vs `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx` with `sidebar_position: 49`)

## Version-Specific Content

- For new features, add a version info box using the `:::info` syntax: `:::info\n\nAdded in Scrcpy VERSION\n\n:::` immediately after the H1 heading (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx`)
- For version-dependent types that change entirely, use two version spans: `<Version until="VERSION">old type</Version><Version since="VERSION">new type</Version>` (Example: `@tango-adb/docs/docs/scrcpy/options/lock-video-orientation.mdx`)
- For new additions that didn't exist in older versions, use a single version span: `<Version since="VERSION">new addition</Version>`
- For version-dependent types, use a sub-list format with one list item per version range: `* **Type**:`, `* <Version until="VERSION">type before</Version>`, `* <Version since="VERSION">type after</Version>` (Example: `@tango-adb/docs/docs/scrcpy/options/lock-video-orientation.mdx`)
- For new additions that replace existing functionality, use the `:::info` syntax for addition and `:::danger` syntax for deprecation (Example: `@tango-adb/docs/docs/scrcpy/options/lock-video-orientation.mdx` has both)
- When adding new options, also add them to the list in `@tango-adb/docs/docs/scrcpy/options/index.mdx` using the proper version span syntax
- When using version spans, add the import statement `import Version from "../version-span";` at the top of the MDX file (only if you actually use the Version component)
- Do not add version info boxes for features added in v1.15 (the initial version) since they are part of the baseline functionality.

## Deprecated Options

- For deprecated options, use a `:::danger` box with the "Deprecated in Scrcpy VERSION" header and specify which option to use instead (Example: `@tango-adb/docs/docs/scrcpy/options/lock-video-orientation.mdx`)
- Both added and deprecated info boxes can coexist in the same documentation file, with the `:::info` box appearing first to indicate when the option was originally added, followed by the `:::danger` box indicating when it was deprecated (Example: `@tango-adb/docs/docs/scrcpy/options/lock-video-orientation.mdx`)
- When documenting deprecated options, add them to the cleanup list in the cleanup documentation to indicate they are restored during cleanup process (Example: `@tango-adb/docs/docs/scrcpy/options/cleanup.mdx`)
- For new options that replace old ones, add cross-links between the old and new option documentation pages (Example: `@tango-adb/docs/docs/scrcpy/options/lock-video-orientation.mdx` references `captureOrientation`, and `@tango-adb/docs/docs/scrcpy/options/capture-orientation.mdx` references `lockVideoOrientation`)

## Strongly-Typed Options

- For options with strongly-typed wrapper classes (like ScrcpyCodecOptions, ScrcpyVideoCodecOptions, InstanceId), provide detailed documentation of their methods and properties similar to the API documentation structure (Example: `@tango-adb/docs/docs/scrcpy/options/codec-options.mdx`)
- When documenting strongly-typed options with class implementations, provide comprehensive API documentation for the class with its constructor, properties, and methods in a dedicated section, similar to the API documentation structure (Example: `@tango-adb/docs/docs/scrcpy/options/new-display.mdx`)
- Follow the source code patterns where options implement the `ScrcpyOptionValue` interface and include a `toOptionValue()` method that serializes the value to a string format (Example: `@tango-adb/docs/docs/scrcpy/options/option-value.mdx`)
- Use the correct exported class names from the `latest.ts` file (e.g., `ScrcpyCaptureOrientation` instead of `CaptureOrientation`, `ScrcpyNewDisplay` instead of `NewDisplay`) (Example: `@tango-adb/docs/docs/scrcpy/options/new-display.mdx` uses `ScrcpyNewDisplay`)

## Example Documentation

- For options that accept both strongly-typed classes and string formats, provide examples for both approaches in separate code blocks with descriptive headers ("Using X class instance for type-safe configuration" and "Using string format for simple configuration") (Example: `@tango-adb/docs/docs/scrcpy/options/crop.mdx`)
- When documenting options that accept both strongly-typed classes and string formats, include separate examples in distinct code blocks with descriptive headers ("Using X class instance for type-safe configuration" and "Using string format for simple configuration") (Example: `@tango-adb/docs/docs/scrcpy/options/capture-orientation.mdx`)
- When documenting options that require other options to function, include examples that demonstrate the proper combination of options (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx` shows how it requires `newDisplay`)
- For options that require related options to function properly, always demonstrate the proper usage pattern in examples (Example: `@tango-adb/docs/docs/scrcpy/options/vd-destroy-content.mdx` shows how it relates to `newDisplay`)

## Behavior-Specific Documentation

- For options that only have an effect when set to `false` (where `true` is the default behavior and setting it to `true` has no effect), clearly state this in the description: "By default, [feature] is enabled in Scrcpy, meaning [...]. Adding this option with a value of `true` has no effect since this is the default behavior. Only setting this option to `false` will [disable/change the behavior]." (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx` and `@tango-adb/docs/docs/scrcpy/options/vd-destroy-content.mdx`)
- When documenting options that affect system settings, mention how they modify the system behavior and indicate that these changes are reversed during cleanup (Example: `@tango-adb/docs/docs/scrcpy/options/stay-awake.mdx`)

## API Documentation Structure

For API documentation pages:
- Use lowercase with hyphens for file names (e.g., `my-function.mdx`) (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- When documenting individual methods/functions, use camelCase for the page title without prefixes (e.g., `# myFunction`) (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- For executable overview pages, use the executable name as the title (e.g., `# Package Manager ('pm')`) (Example: `@tango-adb/docs/docs/api/adb/pm.mdx`)
- Start with an H1 heading (using `#`) that describes the API or executable (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)
- Include an overview section that explains what the API/executable does (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)
- Document each method/function with appropriate heading levels (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)
- When documenting interface members, use a header level one deeper than the parent interface section (e.g., if documenting `SomeInterface` with `###`, its members should use `####`) (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)
- Include TypeScript code blocks with proper syntax highlighting (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Include detailed parameter documentation with both TypeScript interface and descriptive lists (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Provide usage examples where appropriate (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Use consistent terminology throughout the page (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)
- Document namespaces and interfaces clearly with proper TypeScript syntax (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Use Markdown tables with proper alignment for documenting fields and parameters (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)

## Code Blocks

- Use triple backticks with `ts` language identifier for TypeScript definitions (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Include `declare class` syntax when showing class interfaces (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Use `ts transpile` for executable code examples (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx`)
- Use triple backticks with `sh` language identifier for shell commands (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)
- Use `sh npm2yarn` for package manager commands that should show both npm and yarn variants (Example: `@tango-adb/docs/docs/getting-started.mdx`)
- Maintain proper indentation in code blocks (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx`)
- Use `showLineNumbers` directive in code blocks when referring to specific lines (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)

## Information Boxes

- Use `:::info[Title]` syntax for information boxes containing equivalent commands (Example: `@tango-adb/docs/docs/api/adb/pm.mdx`)
- For info boxes without titles, you can use `:::info` syntax as well (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx` uses `:::info` for version information)
- Place info boxes directly after the relevant content (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx`)
- Include shell script examples in info boxes when showing environment variable usage (Example: `@tango-adb/docs/docs/environment-variables.mdx`)
- Use `:::info` and `:::danger` to show extra information about the library itself (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx` uses `:::info` for version information)
- Use `:::note` for important additional information or cross-references (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)

## Environment Variables

- Use the correct environment variable names: `ANDROID_ADB_SERVER_ADDRESS` and `ANDROID_ADB_SERVER_PORT` (Example: `@tango-adb/docs/docs/environment-variables.mdx`)
- Do not use incorrect aliases like `ADB_SERVER_ADDRESS` or `ADB_SERVER_PORT` (Example: `@tango-adb/docs/docs/environment-variables.mdx`)
- Include both individual variable examples and combined usage scenarios (Example: `@tango-adb/docs/docs/environment-variables.mdx`)
- Show proper export syntax in shell examples (Example: `@tango-adb/docs/docs/environment-variables.mdx`)

## Special Content Types

- Include detailed explanations of technical concepts with examples (Example: `@tango-adb/docs/docs/architecture.mdx`)
- Use consistent terminology and formatting for similar elements across pages (Example: `@tango-adb/docs/docs/scrcpy/options/power-off-on-close.mdx`)
- Group related shell commands in the same block when possible (Example: `@tango-adb/docs/docs/api/adb/adb.mdx`)

## Source Code Interface Patterns

The Scrcpy source code follows specific patterns when evolving the `Init` interface across versions:

### Implementation Structure

The Scrcpy library uses a versioned implementation structure in the `impl` folders (like `@yume-chan/ya-webadb/libraries/scrcpy/src/3_1/impl/`). Each version contains specific files that define the interface contracts and implementation details:

- `init.ts`: Defines the `Init` interface for that version which extends from the previous version and adds new properties (Example: `@yume-chan/ya-webadb/libraries/scrcpy/src/3_1/impl/init.ts`)
- `index.ts`: Exports the main interfaces, types, and functions for the version (Example: `@yume-chan/ya-webadb/libraries/scrcpy/src/3_1/impl/index.ts`)
- `prev.ts`: Provides type reference to the previous version's implementation for extension purposes, typically exporting the previous version as `PrevImpl` (Example: `@yume-chan/ya-webadb/libraries/scrcpy/src/3_1/impl/prev.ts`)
- `defaults.ts`: Contains default values for options in that version, often extending defaults from the previous version (Example: `@yume-chan/ya-webadb/libraries/scrcpy/src/3_1/impl/defaults.ts`)
- `serialize-*.ts`: Contains serialization functions for specific features that may vary between versions (Example: `@yume-chan/ya-webadb/libraries/scrcpy/src/3_1/impl/serialize-uhid-create.ts`)

### Adding New Options

When adding new options in a new version, the `Init` interface extends the previous interface and adds new properties:

```ts
// Example from 3.0 version
export interface Init<TVideo extends boolean> extends Omit<
    PrevImpl.Init<TVideo>,
    "lockVideoOrientation"
> {
    captureOrientation?: CaptureOrientation | string | undefined;
    angle?: number;
    screenOffTimeout?: number | undefined;
    listApps?: boolean;
    newDisplay?: NewDisplay | string | undefined;
    vdSystemDecorations?: boolean;
}
```

### Extending Existing Options

When extending existing option types (adding new possible values), the type definition is updated to include the new value:

```ts
// Example: Adding "flac" to audioCodec in version 2.3
export interface Init<TVideo extends boolean> extends Omit<
    PrevImpl.Init<TVideo>,
    "audioCodec"
> {
    audioCodec?: PrevImpl.Init<TVideo>["audioCodec"] | "flac";
}
```

### Removing Deprecated Options

When removing deprecated options, they are excluded using `Omit` and the old option is no longer available:

```ts
// Example from 3.0 version - completely removing lockVideoOrientation
export interface Init<TVideo extends boolean> extends Omit<
    PrevImpl.Init<TVideo>,
    "lockVideoOrientation"  // Completely removes the old option
> {
    // captureOrientation replaces lockVideoOrientation with enhanced capabilities
    captureOrientation?: CaptureOrientation | string | undefined;
    // ... other new options
}
```

This approach ensures backward compatibility while allowing for evolution of the API across versions.

## Class Constructors

When documenting class constructors with multiple overloads:
- Create separate subsections for each overload variant (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Include the TypeScript signature with `declare class` syntax (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Describe the behavior of each overload (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Provide equivalent ADB command line options in info boxes (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Include shell script examples for environment variables (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)
- Show practical usage examples with proper syntax highlighting (Example: `@tango-adb/docs/docs/api/adb/subprocess/spawn.mdx`)

## Complex Type Documentation

- When documenting options with complex type structures, create dedicated sections with direct links to the relevant classes or properties in other documentation pages (Example: `@tango-adb/docs/docs/scrcpy/options/codec-options.mdx`)
- When documenting options that affect system settings, mention how they modify the system behavior and indicate that these changes are reversed during cleanup (Example: `@tango-adb/docs/docs/scrcpy/options/stay-awake.mdx`)
- When documenting options that require other options to function, include examples that demonstrate the proper combination of options (Example: `@tango-adb/docs/docs/scrcpy/options/vd-system-decorations.mdx` shows how it requires `newDisplay`)

## Managing Sidebar Positions

- To maintain proper chronological order of Scrcpy options in the sidebar, use the `update-sidebar-positions.js` script in `@tango-adb/docs/docs/scrcpy/options/` to automatically update all `sidebar_position` values
- The script orders options by when they were first introduced in Scrcpy versions, with foundational concepts first and advanced topics at the end
- After adding new options, run the script to ensure proper ordering is maintained throughout the documentation set

## Reading File Comments

- Before editing any MDX file, check for MDX comment blocks (`{/* ... */}`) at the top of the file
- These blocks may contain specific formatting instructions or constraints for that particular file
- Follow the instructions in the comment block to maintain consistency with file-specific requirements

## Scrcpy Options Directory Structure

- The `@tango-adb/docs/docs/scrcpy/options/` directory contains documentation for all Scrcpy options organized by version
- Each subdirectory (e.g. `v1.15/`, `v2.0/`) contains options introduced or modified in that specific version
- Option files follow the format `option-name.mdx` where the filename corresponds to the camelCase option name
- Files contain version-specific information with proper deprecation notices when options are replaced
- The main directory also contains shared resources like `option-value.mdx`, `index.mdx`, `inheritance.mdx`, and `_category_.yml`
- Use the `update-sidebar-positions.js` script to maintain proper chronological ordering of options in the sidebar

## Moving Files Considerations

- When moving MDX files to different directories, always update relative paths for internal links (e.g., `../`, `./` paths pointing to other documentation files)
- Update import paths for custom components (e.g., `import` statements for custom React components like `can-i-use`, `Version`, etc.)
- When creating subdirectories, consider updating `_category_.yml` files to properly organize navigation
- Adjust `sidebar_position` values as needed to maintain proper ordering after restructuring
- Test all links after moving files to ensure no broken references remain
- Remember that moving files to subdirectories changes the relative path depth, requiring adjustments to all relative links within the moved files

## Creating Mermaid Flowcharts for Type Relationships

- Use subgraphs to group related types or components (Example: `"subgraph D [\"WebCodecsVideoDecoder\"]"` in `@tango-adb/docs/docs/scrcpy/video/webcodecs/index.mdx`)
- Show member relationships by including member properties/methods inside the appropriate subgraph (Example: `E["decoder.writable<br/>(WritableStream)"]` inside the decoder subgraph in `@tango-adb/docs/docs/scrcpy/video/webcodecs/index.mdx`)
- Represent constructor relationships by showing how types are instantiated and what parameters they require (Example: `G["InsertableStreamVideoFrameRenderer"] --> B["new WebCodecsVideoDecoder()"]` in `@tango-adb/docs/docs/scrcpy/video/webcodecs/index.mdx`)
- Use diamond brackets `[/ ... /]` for input objects and `[\ ... \]` for output/result objects (Example: `[/"an AdbDaemonConnection<br>object/]"` in `@tango-adb/docs/docs/tango/daemon/index.mdx`)
- Include clickable links to relevant documentation sections using the `click` keyword (Example: `click A "#browser-support"` in `@tango-adb/docs/docs/scrcpy/video/webcodecs/index.mdx`)
- Apply consistent styling with class definitions to highlight interactive elements (Example: `classDef link text-decoration: underline;` in `@tango-adb/docs/docs/scrcpy/video/webcodecs/index.mdx`)
- Use `&` operator to connect multiple nodes to a single target (Example: `G & H & I --> B` in `@tango-adb/docs/docs/scrcpy/video/webcodecs/index.mdx`)
- Use different flow directions based on the relationship being shown: TD (top-down), LR (left-right), TB (top-bottom) (Example: `flowchart TD` in `@tango-adb/docs/docs/scrcpy/video/webcodecs/index.mdx`)
- Use different edge styles for different types of relationships: `-->` for direct flow, `<-->` for bidirectional, `x-.-x` for exclusive access (Example: `"TB <-->|USB| AD"` in `@tango-adb/docs/docs/tango/daemon/index.mdx`)
- Group related functionality in subgraphs to show functional boundaries (Example: `"subgraph M [\"an AdbDaemonWebUsbDeviceManager instance\"]"` in `@tango-adb/docs/docs/tango/daemon/index.mdx`)
- Use descriptive labels with relationship types (Example: `"TA <-->|TCP| S"` to show that TCP is the connection type between TA and S in `@tango-adb/docs/docs/tango/daemon/index.mdx`)

## Documentation Formatting Tools

- Use the `format-mdx.js` script to automatically apply proper MDX formatting rules (Example: `node format-mdx.js docs/scrcpy/video/webcodecs/decoder.mdx`)
- The script enforces proper spacing around headers and code blocks as specified in the formatting rules
- The script handles internal code block formatting to ensure proper empty line requirements
- Run the script on MDX files to ensure they comply with the documentation standards