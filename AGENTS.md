# Documentation Formatting Rules

This document outlines the formatting rules and guidelines for maintaining consistent documentation across the Tango ADB project. This document follows the same formatting rules it describes.

## Root Level (@tango-adb/docs/docs/)

Root-level documentation contains the main entry points and shared components for the documentation site. This includes the main index page, shared utility components like `can-i-use.tsx` and `script.tsx`, and serves as the parent directory for all major documentation sections.

### Document Structure

Rules for organizing documentation files with proper MDX formatting, frontmatter, headings, and import statements.

- Use proper Docusaurus MDX formatting
- Use `---` frontmatter for metadata
- Start with H1 heading using `#` that describes the topic
- Include import statements at top when referencing custom components (only if used)
- Use appropriate heading levels (h1, h2, h3, h4) for document hierarchy

### General Formatting

Formatting guidelines for spacing, line breaks, paragraph structure, and general document layout consistency.

- Separate major sections with blank lines for readability
- Add adequate line breaks between major sections
- Separate code blocks from prose with blank lines
- Use blank lines around info boxes for visual separation
- Maintain consistent spacing throughout documents
- Add one empty line before and after lists (ordered/unordered) but no empty lines between list items
- No more than 1 consecutive empty line anywhere in document (max 2 line break chars `\n`)
- Exactly 1 empty line before and after each header (`#`, `##`, etc.) and code block (```)
- No empty lines at beginning/end inside code blocks
- One empty line sufficient if header/code block immediately follows another header/code block
- Prefer short paragraphs
- Always use Markdown code spans for type names, method names, and similar technical terms
- Do not run Prettier on MDX files (breaks React components like `<Version>` tags)
- Include detailed explanations of technical concepts with examples
- Use consistent terminology and formatting for similar elements across pages
- Group related shell commands in same block when possible
- Use `format-mdx.js` script to automatically apply proper MDX formatting rules
- Script enforces proper spacing around headers and code blocks as specified in formatting rules
- Script handles internal code block formatting to ensure proper empty line requirements
- Run script on MDX files to ensure they comply with documentation standards

#### MDX Comment Escaping Issue

**Important:** The `edit` tool has a bug that breaks MDX comments (`{/* ... */}`) by escaping backslashes.

**Symptoms:** MDX comments become malformed after edits and no longer render. Run the workaround command below to fix them.

**Workaround:** After any `edit` operation on MDX files, run this fix command:

```bash
sed -i 's/{\/\\\*/{\/\*/g' path/to/file.mdx && sed -i 's/\\\*\/*}/\*\/}/g' path/to/file.mdx
```

**Verification:** Check that MDX comments are properly formatted:

```bash
grep -c "{/*" path/to/file.mdx  # Should return count > 0
grep -c "*/}" path/to/file.mdx  # Should match the same count
```

Always verify MDX comments after edits before committing changes.

#### Using `<Version>` Tag

Best practices for using the `<Version>` component to conditionally render version-dependent content.

- Import `Version` from `"../version-span"` at the top of the file when using this component
- Use `since` and `until` props to define version ranges (e.g., `<Version since="v2.0" until="v3.3.4">`)
- The tag renders its content with a version badge appended (e.g., `"(since v2.0)"` or `"(v1.22 to v1.25)"`), so do not duplicate version numbers inside the tag content
- Use mutually exclusive, non-overlapping version ranges to avoid conflicting content being rendered together
- Each `<Version>` branch should produce a complete, coherent sentence when combined with the surrounding base text
- The base text outside `<Version>` tags can be a fragment — it's acceptable for it to be incomplete since at least one Version branch will always complete it

**Example:**

```mdx
`deviceName`: Always present<Version until="v1.22"> (no option to disable)</Version><Version since="v1.22">, unless [`sendDeviceMeta`](../options/v1.22/send-device-meta.mdx) is `false`</Version>.
```

- `until="v1.22"` branch renders: "Always present (no option to disable) (until v1.22)."
- `since="v1.22"` branch renders: "Always present, unless sendDeviceMeta is false (since v1.22)."

**Avoid:**

- Do not put version numbers like "v1.22" inside the tag content — the tag adds them automatically
- Do not use overlapping or duplicate version ranges (e.g., both `<Version until="v3.3.4">` and `<Version since="v2.0" until="v3.3.4">` active at the same time)

**Incorrect example to avoid:**

```mdx
❌ Version number duplicated in content:
<Version since="v1.22">From v1.22+, present unless...</Version>
```

### Frontmatter & Navigation

Rules for configuring sidebar navigation, positioning, and category organization in Docusaurus.

- Include `sidebar_position` in frontmatter for proper navigation ordering
- `index.mdx` files do not include `sidebar_position` (order determined by `position` in parent `_category_.yml`)
- Use `_category_.yml` files to configure sidebar navigation
- Include `position` property to control ordering in sidebar
- Use `label` property for display name in sidebar
- All `_category_.yml` files must include `label` property
- Set `collapsed: false` to show sub-items expanded by default

### Code Blocks

Guidelines for formatting code examples with proper syntax highlighting and indentation.

- Use triple backticks with `ts` for TypeScript definitions
- Include `declare class` syntax when showing class interfaces
- Use `ts transpile` for executable code examples
- Use triple backticks with `sh` for shell commands
- Use `sh npm2yarn` for package manager commands showing both npm and yarn
- Maintain proper indentation in code blocks
- Use `showLineNumbers` directive when referring to specific lines

#### TypeScript Code Block Standards

Rules for writing TypeScript code examples with proper type annotations and variable declarations.

- **Explicit type annotations**: Always explicitly mark variable types (e.g., `const store: AdbCredentialManager`)
- **Declare external variables**: Use `declare const xxx: T` to declare variables that are created outside of the code snippet
- **Import all types**: Include proper import statements for all types used in the code example
- **Show complete examples**: Code blocks should be self-contained with all necessary imports and declarations
- **No unused imports or variables**: Every import and declared variable must be used in the code example
- **Type-only imports**: Use `import type` for types that are only used in type positions (type annotations, interface extensions, etc.). Values imported with `import type` must not be used at runtime
- **Merge imports**: Imports from the same module should be consolidated into at most one `import` statement and at most one `import type` statement

**Example:**

```ts
import type { Adb, AdbSyncSocket, ReadableStream } from "@yume-chan/adb";
import { AdbSync, encodeUtf8 } from "@yume-chan/adb";

declare const adb: Adb;
declare const socket: AdbSyncSocket;

// Explicit type annotation on variable
const stream: ReadableStream<Uint8Array> = adb.sync.read("/sdcard/file.txt");

// Using namespaced function
await AdbSync.Send.send({
  v2: true,
  socket,
  filename: "/sdcard/file.txt",
  file: stream,
});

// Using runtime value
const data: Uint8Array = encodeUtf8("Hello");
```

**Migration guide examples:**

When showing before/after migration examples, follow this pattern:

```ts
// Before: Direct function import
import type { AdbSyncSocket, ReadableStream } from "@yume-chan/adb";
import { adbSyncPull } from "@yume-chan/adb";

declare const socket: AdbSyncSocket;
declare const path: string;

const stream: ReadableStream<Uint8Array> = adbSyncPull(socket, path);
```

```ts
// After: Namespaced under AdbSync.Receive
import type { AdbSyncSocket, ReadableStream } from "@yume-chan/adb";
import { AdbSync } from "@yume-chan/adb";

declare const socket: AdbSyncSocket;
declare const path: string;

const stream: ReadableStream<Uint8Array> = AdbSync.Receive.stream(socket, path);
```

#### Showing Imported Types

When referencing types from other packages in type declaration code blocks:

- Keep real `import type` statements only for very common/simple types (e.g., `Event`, `ReadableStream`)
- For non-trivial types, inline the full definition so readers can see the shape at a glance
- Add a commented `import type` line to show the import path for copy-paste usage

```ts
import type { Event } from "@yume-chan/event";

// import type { ScrcpyVideoSizeChangedEvent } from "@yume-chan/scrcpy";
interface ScrcpyVideoSizeChangedEvent {
  width: number;
  height: number;
  isClientResize?: boolean | undefined;
}
```

**Incorrect examples to avoid:**

```ts
// ❌ Multiple import statements from same module
import type { Adb } from "@yume-chan/adb";
import { AdbSync } from "@yume-chan/adb";
import type { ReadableStream } from "@yume-chan/adb";

// ❌ Type used at runtime (imported with import type)
import type { AdbSync } from "@yume-chan/adb";
await AdbSync.Send.send(...); // Error: AdbSync is a type-only import

// ❌ Unused imports or variables
import type { AdbPowerService } from "@yume-chan/adb"; // Never used
declare const unused: string; // Never used
```

**Migration guide examples:**

When showing before/after migration examples, follow this pattern:

```ts
// Before: Direct function import
import type { AdbSyncSocket, ReadableStream } from "@yume-chan/adb";
import { adbSyncPull } from "@yume-chan/adb";

declare const socket: AdbSyncSocket;
declare const path: string;

const stream: ReadableStream<Uint8Array> = adbSyncPull(socket, path);
```

```ts
// After: Namespaced under AdbSync.Receive
import type { AdbSyncSocket, ReadableStream } from "@yume-chan/adb";
import { AdbSync } from "@yume-chan/adb";

declare const socket: AdbSyncSocket;
declare const path: string;

const stream: ReadableStream<Uint8Array> = AdbSync.Receive.stream(socket, path);
```

### Information Boxes

Standards for using info boxes, warnings, and note containers to enhance documentation clarity.

- Use `:::info[Title]` for info boxes containing equivalent commands
- Use `:::info` for info boxes without titles
- Place info boxes directly after relevant content
- Include shell script examples in info boxes for environment variable usage
- Use `:::info` and `:::danger` to show extra library information
- Use `:::note` for important additional information or cross-references

### Environment Variables

Guidelines for documenting environment variables and their proper usage in shell commands.

- Use correct environment variable names: `ANDROID_ADB_SERVER_ADDRESS` and `ANDROID_ADB_SERVER_PORT`
- Do not use incorrect aliases like `ADB_SERVER_ADDRESS` or `ADB_SERVER_PORT`
- Include both individual variable examples and combined usage scenarios
- Show proper export syntax in shell examples

## API (@tango-adb/docs/docs/api/)

API documentation covers the various APIs provided by the Tango ADB project, organized by functionality (adb, bin, server). This section documents the programmatic interfaces and methods available for interacting with the system.

### API Documentation Structure

API-specific rules for documenting methods, functions, interfaces, and class constructors with proper TypeScript syntax, parameter documentation, and usage examples.

- Use lowercase with hyphens for file names (e.g., `my-function.mdx`)
- When documenting methods/functions, use camelCase for page title without prefixes (e.g., `# myFunction`)
- For executable overview pages, use executable name as title (e.g., `# Package Manager ('pm')`)
- Include overview section explaining what API/executable does
- Document each method/function with appropriate heading levels
- When documenting interface members, use header level one deeper than parent interface section
- Include TypeScript code blocks with proper syntax highlighting
- Include detailed parameter documentation with both TypeScript interface and descriptive lists
- Provide usage examples where appropriate
- Use consistent terminology throughout page
- Document namespaces and interfaces clearly with proper TypeScript syntax
- Use Markdown tables with proper alignment for documenting fields and parameters

### Source Code Interface Patterns

Patterns for documenting versioned interfaces, implementation structures, and evolution of API contracts.

- Scrcpy source code follows specific patterns when evolving `Init` interface across versions

#### Implementation Structure

- Scrcpy library uses versioned implementation structure in `impl` folders (like `@yume-chan/ya-webadb/libraries/scrcpy/src/3_1/impl/`)
- Each version contains specific files defining interface contracts and implementation details
- `init.ts`: Defines `Init` interface for version which extends from previous version and adds new properties
- `index.ts`: Exports main interfaces, types, and functions for version
- `prev.ts`: Provides type reference to previous version's implementation for extension purposes
- `defaults.ts`: Contains default values for options in that version, often extending defaults from previous version
- `serialize-*.ts`: Contains serialization functions for specific features that may vary between versions

##### Interface File Organization

Standards for organizing versioned interface files and their dependencies.

##### Adding New Options

Guidelines for extending interfaces with new properties in versioned implementations.

- When adding new options in new version, `Init` interface extends previous interface and adds new properties

##### Extending Existing Options

Standards for updating type definitions to include new possible values.

- When extending existing option types (adding new possible values), type definition is updated to include new value

##### Removing Deprecated Options

Guidelines for excluding deprecated options using `Omit` and managing backwards compatibility.

- When removing deprecated options, they are excluded using `Omit` and old option is no longer available

### Creating Mermaid Flowcharts for Type Relationships

- Use ```mermaid code blocks to wrap diagrams
- Choose appropriate diagram types: flowchart for relationships, sequenceDiagram for interactions
- Use flowchart directions: TD (top-down), LR (left-right), TB (top-bottom) based on relationship being shown
- Use subgraphs to group related types or components
- Show member relationships by including member properties/methods inside appropriate subgraph
- Represent constructor relationships by showing how types are instantiated and what parameters they require
- Use diamond brackets `[/ ... /]` for input objects and `[\ ... \]` for output/result objects
- Include clickable links to relevant documentation sections using `click` keyword
- Apply consistent styling with classDef definitions to highlight interactive elements
- Use `&` operator to connect multiple nodes to single target
- Use different edge styles for different types of relationships: `-->` for direct flow, `<-->` for bidirectional, `-.->` for indirect connections
- Group related functionality in subgraphs to show functional boundaries
- Use descriptive labels with relationship types
- Define link styling with classDef and apply to clickable nodes
- Use class assignments to make nodes clickable: `class A,B,C link;` syntax
- Add click handlers with `click NODE "URL"` syntax to make nodes link to documentation
- Use node identifiers that derive from original words (take first letter or two-letter abbreviation from the original word/phrase)
- Ensure node identifiers are unique within each flowchart diagram

#### Diagram Standards

Standards for creating effective Mermaid diagrams that illustrate type relationships and system architecture, including proper syntax, styling, and interactivity.

### Class Constructors

Rules for documenting class constructors with overloads, signatures, and usage examples.

- Create separate subsections for each overload variant
- Include TypeScript signature with `declare class` syntax
- Describe behavior of each overload
- Provide equivalent ADB command line options in info boxes
- Include shell script examples for environment variables
- Show practical usage examples with proper syntax highlighting

## Scrcpy (@tango-adb/docs/docs/scrcpy/)

Scrcpy documentation covers screen mirroring and control functionality, including server preparation, connection handling, option configuration, and control mechanisms. This section includes version-specific options and control interfaces.

### Options (@tango-adb/docs/docs/scrcpy/options/)

Scrcpy options documentation details the various configuration parameters, organized by version (v1.15 through v3.2) and including inheritance mechanisms and option value types.

- Order by: foundational concepts first (like `ScrcpyOptionValue`), then options by version added and by order in source code, with advanced topics (like `Inheritance`) at bottom
- For Scrcpy options documentation pages, include a source reference comment indicating the originating source file and the repository commit hash. The comment must be placed **immediately after the H1 heading** (and any import statements) using the format:

```mdx
{/* Source: libraries/scrcpy/src/<path>.ts | Commit: <commit-hash> */}
```

Maintain a blank line before and after the comment. This rule will later be extended to cover all API documentation pages.


#### Strongly-Typed Options

Guidelines for documenting strongly-typed option classes and their API interfaces.

- For options with strongly-typed wrapper classes (like ScrcpyCodecOptions, ScrcpyVideoCodecOptions, InstanceId), provide detailed documentation of methods and properties similar to API documentation structure
- When documenting strongly-typed options with class implementations, provide comprehensive API documentation for class with constructor, properties, and methods in dedicated section
- Follow source code patterns where options implement `ScrcpyOptionValue` interface and include `toOptionValue()` method that serializes value to string format
- Use correct exported class names from `latest.ts` file (e.g., `ScrcpyCaptureOrientation` instead of `CaptureOrientation`, `ScrcpyNewDisplay` instead of `NewDisplay`)

#### Example Documentation

Standards for providing code examples that demonstrate proper usage patterns.

- For options accepting both strongly-typed classes and string formats, provide examples for both approaches in separate code blocks with descriptive headers
- When documenting options requiring other options to function, include examples demonstrating proper combination of options
- For options requiring related options to function properly, always demonstrate proper usage pattern in examples

#### Behavior-Specific Documentation

Guidelines for documenting option behaviors and system interactions.

- For options only having effect when set to `false` (where `true` default and setting to `true` has no effect), clearly state: "By default, [feature] is enabled in Scrcpy, meaning [...]. Adding this option with a value of `true` has no effect since this is the default behavior. Only setting this option to `false` will [disable/change the behavior]."
- When documenting options affecting system settings, mention how they modify system behavior and indicate changes are reversed during cleanup

#### Version-Specific Content (Control)

- For new features, add version info box using `:::info` syntax: `:::info\n\nAdded in Scrcpy VERSION\n\n:::` immediately after H1 heading
- When using version spans, add import statement `import Version from "../version-span";` at top of MDX file (only if actually using Version component)
- Do not add version info boxes for features added in v1.15 (initial version) since they are baseline functionality

#### Control Directory Structure

Guidelines for documenting scrcpy control features with version-specific information.

#### Deprecated Options

- For deprecated options, use `:::danger` box with "Deprecated in Scrcpy VERSION" header and specify which option to use instead
- Both added and deprecated info boxes can coexist in same documentation file
- When documenting deprecated options, add them to cleanup list in cleanup documentation to indicate they are restored during cleanup process
- For new options that replace old ones, add cross-links between old and new option documentation pages

#### Directory Structure

- Each subdirectory (e.g. `v1.15/`, `v2.0/`) contains options introduced or modified in that specific version
- Option files follow format `option-name.mdx` where filename corresponds to camelCase option name
- Files contain version-specific information with proper deprecation notices when options are replaced
- Main directory also contains shared resources like `option-value.mdx`, `index.mdx`, `inheritance.mdx`, and `_category_.yml`

#### Directory Structure

- Each subdirectory (e.g. `v1.15/`, `v2.0/`) contains options introduced or modified in that specific version
- Option files follow format `option-name.mdx` where filename corresponds to camelCase option name
- Files contain version-specific information with proper deprecation notices when options are replaced
- Main directory also contains shared resources like `option-value.mdx`, `index.mdx`, `inheritance.mdx`, and `_category_.yml`

#### Managing Sidebar Positions

- To maintain proper chronological order of Scrcpy options in sidebar, use `update-sidebar-positions.js` script in `@tango-adb/docs/docs/scrcpy/options/` to automatically update all `sidebar_position` values
- Script orders options by when they were first introduced in Scrcpy versions, with foundational concepts first and advanced topics at end
- After adding new options, run script to ensure proper ordering maintained throughout documentation set

#### Scrcpy Options Directory Structure

Organizational guidelines for versioned option documentation and sidebar positioning management.

### Control (@tango-adb/docs/docs/scrcpy/control/)

Scrcpy control documentation covers user interaction features such as touch events, keyboard input, clipboard operations, screen power management, and app launching capabilities.

#### Version-Specific Content (Scrcpy)

- For new features, add version info box using `:::info` syntax: `:::info\n\nAdded in Scrcpy VERSION\n\n:::` immediately after H1 heading
- When using version spans, add import statement `import Version from "../version-span";` at top of MDX file (only if actually using Version component)
- Do not add version info boxes for features added in v1.15 (initial version) since they are baseline functionality

## Internal (@tango-adb/docs/docs/internal/)

Internal documentation covers low-level implementation details, architectural decisions, and core systems like connection handling, packet protocols, authentication mechanisms, and version management. This section is intended for developers working on the core system.

### File Organization

- This section is reserved for internal documentation that doesn't fit into other categories
- Include documentation about internal processes, architecture decisions, and development workflows here

#### Internal Documentation Guidelines

Best practices for documenting low-level system internals, protocols, and architectural decisions.

## Tango (@tango-adb/docs/docs/tango/)

Tango documentation covers the core Tango ADB functionality, including device connectivity, transport mechanisms, server operations, and daemon services. This section encompasses both client and server components of the Tango system.

### Daemon (@tango-adb/docs/docs/tango/daemon/)

Tango daemon documentation details the background service functionality, including device connection management, TCP and USB transport handling, credential storage, and custom connection configurations.

#### Reading File Comments

Guidelines for checking file-specific formatting instructions in MDX comment blocks.

- Before editing MDX file, check for MDX comment blocks (`{/* ... */}`) at top of file
- These blocks may contain specific formatting instructions or constraints for that particular file
- Follow instructions in comment block to maintain consistency with file-specific requirements

#### Moving Files Considerations

Best practices for relocating documentation files while maintaining link integrity and navigation.

- When moving MDX files to different directories, always update relative paths for internal links (e.g., `../`, `./` paths pointing to other documentation files)
- Update import paths for custom components (e.g., `import` statements for custom React components like `can-i-use`, `Version`, etc.)
- When creating subdirectories, consider updating `_category_.yml` files to properly organize navigation
- Adjust `sidebar_position` values as needed to maintain proper ordering after restructuring
- Test all links after moving files to ensure no broken references remain
- Remember that moving files to subdirectories changes relative path depth, requiring adjustments to all relative links within moved files

#### Special Sentence Format

Standards for writing documentation with proper terminology and version-specific language patterns.

- For internal documentation pages (in `@tango-adb/docs/docs/internal/`), use format like "Tango ADB supports this Delayed Ack feature..."
- For references to internal pages from other pages, use format "In Tango ADB, delayed ack can be configured by..."
- Preserve important Android version information when mentioning feature origins (e.g., "On Android 14 and newer...")
