# V8 Debugger Protocol

This document describes the message based protocol exposed by V8.
It's a very simple text-based protocol.
As with HTTP there's a strict definition of line breaks:
They MUST be "\r\n".
Every message frame consists of a `headers` and a `body` part:

```
Header-A: Some-Value\r\n
Content-Length: 9\r\n
\r\n
{"seq":1}
```

Each frame MUST have a `Content-Length` headers.
The header value MUST be the byte length of the body section.
The next message starts immediately after the last byte of the body.
The body is generally JSON encoded,
see [frame body](#frame-body) below for the format.

When connecting a special, body-less message is sent by V8.
The following example is from connecting to a node.js instance:

```
Type: connect\r\n
V8-Version: 3.14.5.9\r\n
Protocol-Version: 1\r\n
Embedding-Host: node v0.10.26\r\n
Content-Length: 0\r\n
\r\n
```


## Frame Body

Each message body is a JSON object with the following properties:

* `seq`: Identifier of this message.
         This is used to map responses to the proper request.
* `type`: Either "request", "response", or "event"


### Request Message

These are sent by the debug client to v8.
Request messages have two additional properties:

* `command`: The command that is invoked
* `arguments`: A object with named arguments, optional

[Available commands](#requestresponse-pairs) are documented below.

#### Example

```js
{"seq":117,"type":"request","command":"continue"}
```


### Response Message

These are sent to the debug client by v8.
Response message have the following additional properties:

* `request_seq`: The request this is the response to
* `command`: The original command
* `success`: If true, look at `body`, otherwise look at `message`
* `body`: The "return value" of the command, only if `success` is true
* `message`: Error message for failed commands
* `running`: `false` if the vm is suspended, `true` otherwise
* `refs`: Array of referenced values in the body

The type of body to expect is documented below,
in the section [request/response pairs](#requestresponse-pairs).

#### Example: Successful response

```js
{ "seq":67,
  "type":"response",
  "request_seq":117,
  "command":"continue",
  "success":true,
  "running": true }
```

#### Example: Successful response, returning data

```js
{ "seq":67,
  "type":"response",
  "request_seq":117,
  "command":"scope",
  "success":true,
  "running": true,
  "body": { "index":0, "frameIndex":0 } }
```

#### Example: Failing response

```js
{ "seq":67,
  "type":"response",
  "request_seq":117,
  "command":"frame",
  "success":false,
  "running": true,
  "message": "Missing arguments" }
```

#### Example for `refs`

Important to note:
There's no guarantee that everything referenced inside of `refs`
will itself resolve.
The `ref` properties denote references to mirror objects.
Mirror objects are identifier by their `handle`.
`refs` contains an array of serialized mirror objects.

```js
[ { handle: 4,
    type: 'function',
    className: 'Function',
    constructorFunction: { ref: 8 },
    protoObject: { ref: 9 },
    prototypeObject: { ref: 5 },
    name: 'Error',
    inferredName: '',
    resolved: true,
    source: 'function Error() { [native code] }',
    scopes: [],
    properties: 
     [ { name: 'length', attributes: 7, propertyType: 3, ref: 10 },
       { name: 'name', attributes: 7, propertyType: 3, ref: 11 } ],
    text: 'function Error() { [native code] }' },
  { handle: 6, type: 'undefined', text: 'undefined' },
  { handle: 7,
    type: 'string',
    value: 'err message',
    length: 11,
    text: 'err message' } ]
```


### Event Message

Sent by v8 to the debug client.
The message looks similar to response messages
in that they also contain `body` and `refs`.
Additionally:

* `event`: Type of event

You can find a list of [available events](#events) below.


## Request/response pairs

The name of the command is followed by the name of function in
`src/debug-debugger.js` that handles the command.
Most filenames in this section reference the v8 codebase.
Other important files are `mirror-debugger.js` and `messages.js`
for serialization.
Implementation details of macros can be found in `runtime.cc`.


### Request `continue` - `continueRequest_`

> The request continue is a request from the debugger to start the VM running again.
> As part of the continue request the debugger can specify if it wants the VM to perform a single step action.
>
> In the response the property running will always be true as the VM will be running after executing the continue command.
> If a single step action is requested the VM will respond with a break event after running the step.

*Warning:* Sometimes the non-presence of `arguments` is not the same
as an empty arguments object.
Also even though it looks like the handler for `continue` doesn't do anything
when no arguments are passed in,
the fact that it is setting `response.running` to true will magically resume
execution.

#### Arguments

When no arguments are provided, this command will just resume execution.

For step-based actions, pass the following arguments:

* `stepaction`: One of the actions listed below, string,
                required (the default value is ignored)
* `stepcount`: How many steps to take, uint, optional, default: `1`

Available step actions (taken from `src/debug.h`)

* **out**: Step out of the current function. `StepOut = 0`
* **next**: Step to the next statement in the current function. `StepNext = 1`
* **in**: Step into new functions invoked
          or the next statement in the current function. `StepIn = 2`
* **min**: Perform a minimum step in the current function. `StepMin = 3`

`StepInMin` does not seem to be supported by the debugger protocol.

#### Response

*Empty response*

#### Example: Just resume execution

```js
{"seq":117,"type":"request","command":"continue"}
```

#### Example: Step forward 5 statements

```js
{ "seq":117,"type":"request","command":"continue",
  "arguments": { "stepaction": "next", "stepcount": 5 } }
```


### Request `break` - `breakRequest_`

Seems to be doing nothing. Quote:

> Ignore as break command does not do anything when broken.


### Request `setbreakpoint` - `setBreakPointRequest_`

> The request setbreakpoint creates a new break point.
> This request can be used to set both function and script break points.
> A function break point sets a break point in an existing function
> whereas a script break point sets a break point in a named script.
> A script break point can be set even if the named script is not found.
> 
> The result of the setbreakpoint request is a response with the number of the newly created break point.
> This break point number is used in the changebreakpoint and clearbreakpoint requests.

#### Arguments

* `type`: Type of breakpoint to create, see below (string)
* `target`: Script or function to break at (string)
* `line`/`column`: Position for script breakpoints (uint)
* `enabled`: Starts off enabled, default: true
* `condition`: Expression that guards the breakpoint (string)
* `ignoreCount`: uint, default: 0
* `groupId`: Script breakpoints only,
             allows to clear multiple breakpoints at once, uint.

Known breakpoint types and what `target` should be:

* **function**: `target` evaluates to a function in global scope
* **handle**: `target` is the (stringified) handle of a function
* **script**: `target` is the name of a script
* **scriptId**: `target` is the id of some already compiled script
* **scriptRegExp**: `target` matches the name of a script

#### Response

* `type`: "scriptId", "scriptName", "scriptRegExp", or "function"
* `breakpoint`: Breakpoint id, number
* `actual_locations`: Array of locations where the breakpoint will fire.
                      Will have one element for function breakpoints,
                      may have multiple locations for script breakpoints.
                      Every entry consists of `{scriptId, line, columns}`.
* `line`/`column`: Location of breakpoint, script breakpoint only
* `script_id`: Only for scriptId breakpoints
* `script_name`: Only for scriptName breakpoints
* `script_regexp`: Regex (as string), only for scriptRegExp breakpoints

#### Examples

```js
{"seq":117,"type":"request","command":"setbreakpoint","arguments":{"type":"function","target":"f"}}
{"seq":118,"type":"request","command":"setbreakpoint","arguments":{"type":"script","target":"test.js","line":100}}
{"seq":119,"type":"request","command":"setbreakpoint","arguments":{"type":"function","target":"f","condition":"i > 7"}}
```


### Request `setexceptionbreak` - `setExceptionBreakRequest_`

> The request setexceptionbreak is a request to enable/disable breaks on all / uncaught exceptions.
> If the "enabled" argument is not specify,
> the debuggee will toggle the state of the specified break type.

#### Arguments

* `type`: Either "all" or "uncaught", required
* `enabled`: Defaults to the opposite of whatever the current state is

#### Response

`type` and `enabled`. If enabled wasn't passed in, the response can be used
to detect the current status.

#### Examples

```js
{"seq":117,"type":"request","command":"setexceptionbreak","arguments":{"type":"all"}}
{"seq":118,"type":"request","command":" setexceptionbreak","arguments":{"type":"all","enabled":false}}
{"seq":119,"type":"request","command":" setexceptionbreak","arguments":{"type":"uncaught","enabled":true}}
```


### Request `changebreakpoint` - `changeBreakPointRequest_`

> The request changebreakpoint changes the status of a break point.

#### Arguments

* `breakpoint`: Breakpoint id, number
* `enabled`: Optional, enable or disable the breakpoint
* `condition`: Optional, change the condition
* `ignoreCount`: Optional, reset the ignore count

#### Response

*Empty response*


### Request `clearbreakpoint` - `clearBreakPointRequest_`

> The request clearbreakpoint clears a break point.

#### Arguments

* `breakpoint`: Breakpoint id, number

#### Response

* `breakpoint`: Breakpoint id, number

#### Examples

```js
{"seq":117,"type":"request","command":"clearbreakpoint","arguments":{"type":"function","breakpoint":1}}
{"seq":118,"type":"request","command":"clearbreakpoint","arguments":{"type":"script","breakpoint":2}}
```


### Request `clearbreakpointgroup` - `clearBreakPointGroupRequest_`

#### Arguments

* `groupId`: Breakpoint group id, number

#### Response

* `breakpoints`: Array of cleared breakpoint ids


### Request `listbreakpoints` - `listBreakpointsRequest_`

> The request listbreakpoints is used to get information on breakpoints
> that may have been set by the debugger.

This seems to only list script break points.

#### Arguments

*No arguments*

#### Response

* `breakpoints`: Array of breakpoints, see below
* `breakOnExceptions`: Current state of "all"
* `breakOnUncaughtExceptions`: Current state of "uncaught"

Breakpoint descriptions contain the following fields:

* `type`: "scriptId", "scriptName", "scriptRegExp", or "function"
* `number`: Breakpoint id, number
* `line`/`column`: Position in file
* `groupId`: Breakpoint group id
* `hit_count`: How often the breakpoint was hit already
* `active`: If the breakpoint is enabled
* `condition`: Condition expression
* `ignoreCount`: Remaining ignore count.
                 Will update whenever the breakpoint is ignored.
* `actual_locations`: See above, `{scriptId, line, column}`
* `script_id`: Only for scriptId breakpoints
* `script_name`: Only for scriptName breakpoints
* `script_regexp`: Regex (as string), only for scriptRegExp breakpoints

#### Examples

```js
{"seq":117,"type":"request","command":"listbreakpoints"}
```


### Request `disconnect` - `disconnectRequest_`

> The request disconnect is used to detach the remote debugger
> from the debuggee.
> This will trigger the debuggee to disable all active breakpoints
> and resumes execution if the debuggee was previously stopped at a break.

Disable all breakpoints and continue.

#### Arguments

All arguments that are valid for `continue` will work
though anything but no arguments could be pretty confusing.

#### Response

*Empty response*

#### Examples

```js
{"seq":117,"type":"request","command":"disconnect"}
```


### Request `backtrace` - `backtraceRequest_`

> The request backtrace returns a backtrace (or stacktrace)
> from the current execution state.
> When issuing a request a range of frames can be supplied.
> The top frame is frame number 0.
> If no frame range is supplied data for 10 frames will be returned.

#### Arguments

* `fromFrame`: Index of first frame to return
* `toFrame`: Exclusive end of range
* `bottom`: Boolean, set to true if the bottom of the stack is requested

#### Response

* `fromFrame`: First frame returned
* `toFrame`: Actual last frame returned, might be less than requested `toFrame`
             when less frames are available.
* `totalFrames`: Number of frames currently available
* `frames`: Array of frames

For the properties of each frame, see the `frame` request below.

#### Examples

```js
{"seq":117,"type":"request","command":"backtrace"}
{"seq":118,"type":"request","command":"backtrace","arguments":{"toFrame":2}}
{"seq":119,"type":"request","command":"backtrace","arguments":{"fromFrame":0,"toFrame":9}}
```


### Request `frame` - `frameRequest_`

> The request frame selects a new selected frame
> and returns information for that.
> If no frame number is specified the selected frame is returned.

#### Arguments

* `number`: Optional, the frame to select

#### Response

* `index`: number
* `receiver`: reference
* `func`: reference
* `script`: reference
* `constructCall`: boolean
* `atReturn`: boolean
* `returnValue`: reference, only if `atReturn` is true
* `debuggerFrame`: boolean
* `arguments`: `Array[{name, value}]`, value is a reference
* `locals`: Same as `arguments`
* `scopes`: `Array[{type, index}]`, both are numbers

Valid scope types:

```js
var ScopeType = { Global: 0,
                  Local: 1,
                  With: 2,
                  Closure: 3,
                  Catch: 4,
                  Block: 5 };
```

*Reference: JSONProtocolSerializer.serializeFrame_*

#### Examples

```js
{"seq":117,"type":"request","command":"frame"}
{"seq":118,"type":"request","command":"frame","arguments":{"number":1}}
```


### Request `scopes` - `scopesRequest_`

> The request scopes returns all the scopes for a given frame.
> If no frame number is specified the selected frame is returned.

#### Arguments

A "scope holder". This is either a stack frame or a function.
From `resolveScopeHolder_`:

> Gets scope host object from request.
> It is either a function ('functionHandle' argument must be specified)
> or a stack frame ('frameNumber' may be specified
> and the current frame is taken by default).

For function scopes:

* `functionHandle`: number, retrieves function from mirror cache

For stack frame scopes:

* `frameNumber`: number, has to be a valid frame index.
                 Defaults to currently selected stack frame if omitted.
                 Stack frames are selected via the `frame` request.

Additionally:

* `inlineRefs`: boolean, if true `object` will be returned as a value
                rather than as a reference, see `scope` below.

#### Response

* `fromScope`: number, always 0
* `toScope`: number, always number of scopes
* `totalScopes`: number of scopes
* `scopes`: Array, see `scope` below for properties

#### Examples

```js
{"seq":117,"type":"request","command":"scopes"}
{"seq":118,"type":"request","command":"scopes","arguments":{"frameNumber":1}}
```


### Request `scope` - `scopeRequest_`

> The request scope returns information on a given scope for a given frame.
> If no frame number is specified the selected frame is used.

#### Arguments

A "scope holder" (see `scopes`) plus:

* `number`: A valid scope index, defaults to 0 (top scope)
* `inlineRefs`: boolean, if true `object` will be returned as a value
                rather than as a reference

#### Response

* `index`: index of this scope in the scope chain.
           Index 0 is the top scope and the global scope will always have
           the highest index for a frame *(from v8 wiki)*
           Confusingly the same value that is called `number` above.
* `frameIndex`: The same thing called `frameNumber` above.
* `type`: Scope type, see `frame` above
* `object`: reference or value, an object representing the scope

The `object` part depends on the special `inlineRefs` argument.

##### `object` as reference

Will have just one property, `ref`, which is the mirror's handle.
The object itself will be added to the `refs` part of the response.
Every object added will later be serialized via `serializeReferencedObjects`.
The serialization will exclude `details`
which means that actual property values won't be included.
In other words: For `scope` requests this is a poor fit.

##### `object` as value

This described the general structure of something serialized via
`serialize_(obj, false, true)` - not as reference, with details.
You can assume that a scope object should be an object.

* `type`: string, type of mirror, see below for possible values.
          This is the only property for `'null'` and `'undefined'`.
* `handle`: number, handle of the serialized mirror

For `'boolean'`, `'number'`, `'string'`:

* `value`: May be truncated for strings.
* `length`: Only for strings, total length of string
* `fromIndex`/`toIndex`: 0/length of truncated string.
                         Not present if the string was returned in full.

For `'object'`, `'function'`, `'regexp'`, `'error'` (see `serializeObject_`):

* `className`: string, name of the class
* `constructorFunction`: reference
* `protoObject`: reference
* `prototypeObject`: reference
* `namedInterceptor`: boolean
* `indexedInterceptor`: boolean
* `properties`: Array of property descriptors
* `internalProperties`: Array of property descriptors

All references are serialized via `serializeReferenceWithDisplayData_`.
See the properties section below.

For `'function` only:

* `name`: Name of the function
* `inferredName`: "Nice" name of the function, not always available
* `resolved`: boolean, source is available
* `source`: The source of the function
* `script`: Reference to the script where the function is defined
* `scriptId`: Id of the script where the function is defined`
* `line`/`column`: Position of the function definition in the script
* `position`: Seems to be the same as `line`/`column`

If the object is a date object:

* `value`: ?

###### Properties

Each property is serialized based on `inlineRefs`.
The serialization is handled by `serializeProperty_`.
Property descriptors always have a `name` property.

When `inlineRefs` is enabled then each descripor has a `value` property.
It is filled using `serializeReferenceWithDisplayData_`:

* `ref`: Handle of the mirror object
* `type`: See below for possible types
* `value`: For `'undefined'`, `'null'`, `'boolean'`, `'number'`, `'string'`,
           `'error'`, `'regexp'`.
           For `'string'` the value will be truncated.
           For `'error'` the value will be ?.
* `name`: For `'function'` - name of the function
* `inferredName`: For `'function'` - nice name of the function
* `scriptId`: For `'function'` - Script where the function was defined
* `className`: For `'object'` - name of the class

Without `inlineRefs`, the property descriptor will only contain meta data:

* `ref`: The property value's handle.
* `attributes`: Signals if property is frozen/readOnly/etc..
* `propertyType`: Only if it isn't a "normal" property.

Possible values for property type are:

```js
// from mirror-debugger.js
PropertyType.Normal                  = 0;
PropertyType.Field                   = 1;
PropertyType.Constant                = 2;
PropertyType.Callbacks               = 3;
PropertyType.Handler                 = 4;
PropertyType.Interceptor             = 5;
PropertyType.Transition              = 6;
PropertyType.Nonexistent             = 7;
```

###### Values for `type`

```js
// from mirror-debugger.js
var UNDEFINED_TYPE = 'undefined';
var NULL_TYPE = 'null';
var BOOLEAN_TYPE = 'boolean';
var NUMBER_TYPE = 'number';
var STRING_TYPE = 'string';
var OBJECT_TYPE = 'object';
var FUNCTION_TYPE = 'function';
var REGEXP_TYPE = 'regexp';
var ERROR_TYPE = 'error';
// ignore everything below, won't be retured
var PROPERTY_TYPE = 'property';
var INTERNAL_PROPERTY_TYPE = 'internalProperty';
var FRAME_TYPE = 'frame';
var SCRIPT_TYPE = 'script';
var CONTEXT_TYPE = 'context';
var SCOPE_TYPE = 'scope';
```

#### Examples

```js
{"seq":117,"type":"request","command":"scope"}
{"seq":118,"type":"request","command":"scope","arguments":{"frameNumber":1,"number":1}}
```


### Request `setVariableValue` - `setVariableValueRequest_`

#### Arguments

* `scope`: Scope holder & number
* `name`: Name of the variable to set
* `newValue`: The value to set the variable to

The `newValue` will be resolved via `resolveValue_`.
The following kinds of values are supported:

* `handle`: A mirror's handle
* `stringDescription`/`type`: The description will be parsed.
                              Supported types are `'number'`, `'string'`,
                              and `'boolean'`.
* `value`: Just a value
* `type`: Possible values are `'undefined'` or `'null'`

#### Response

* `newValue`: A mirror object for the new value


### Request `evaluate` - `evaluateRequest_`

> The request evaluate is used to evaluate an expression.
> Optional argument additional_context specifies handles
> that will be visible from the expression under corresponding names

#### Arguments

* `expression`:
* `frame`:
* `global`:
* `disable_break`:
* `additional_context`:

#### Response

The result of evaluating the expression.
See `scope` above for what it looks like.

#### Examples

```js
{"seq":117,"type":"request","command":"evaluate","arguments":{"expression":"1+2"}}
{"seq":118,"type":"request","command":"evaluate","arguments":{"expression":"a()","frame":3,"disable_break":false}}
{"seq":119,"type":"request","command":"evaluate","arguments":{"expression":"[o.a,o.b,o.c]","global":true,"disable_break":true}}
{"seq":120,"type":"request","command":"evaluate","arguments":{"expression":"obj.toString()", "additional_context": [{ "name":"obj","handle":25 }] }}
```


### Request `lookup` - `lookupRequest_`

> The request lookup is used to lookup objects based on their handle.

#### Arguments

* `handles`: Array of mirror handles (numbers)
* `includeSource`: Include source of scripts (if mirrors are scripts)

#### Response

Mirror objects indexed by their handle.
See `scope` for how each entry looks like.

#### Examples

```js
{"seq":117,"type":"request","command":"lookup","arguments":{"handles":[1]}}
{"seq":118,"type":"request","command":"lookup","arguments":{"handles":[7,12]}}
```


### Request `references` - `referencesRequest_`

#### Arguments

* `type`: Either "referencedBy" or "constructedBy"
* `handle`: Object to find references for

#### Response

Array of referenced objects

For `referencedBy`:

> Find all objects with direct references to this object.

For `constructedBy`:

> Returns objects constructed by this function.


### Request `source` - `sourceRequest_`

> The request source retrieves source code for a frame.
> It returns a number of source lines
> running from the fromLine to but not including the toLine,
> that is the interval is open on the "to" end.
> For example, requesting source from line 2 to 4 returns two lines (2 and 3).
> Also note that the line numbers are 0 based: the first line is line 0.

#### Arguments

* `frame`: Index of the frame, default: selected frame.
           Frames are selected with the `frame` request.
* `fromLine`: First line to return, defaults to first line
* `toLine`: First line not to return, defaults to the end of the script

#### Response

* `source`: The actual source code
* `fromLine`: Actual first line returned
* `toLine`: Actual first line not returned
* `fromPosition`: First character index returned
* `toPosition`: First character index not returned
* `totalLines`: Total number of lines in the file

#### Examples

```js
{"seq":117,"type":"request","command":"source","arguments":{"fromLine":10,"toLine":20}}
{"seq":118,"type":"request","command":"source","arguments":{"frame":2,"fromLine":10,"toLine":20}}
```


### Request `scripts` - `scriptsRequest_`

> The request scripts retrieves active scripts from the VM.
> An active script is source code
> from which there is still live objects in the VM.
> This request will always force a full garbage collection in the VM.

#### Arguments

* `types`: Bitmask of script types to retrieve. Defaults to "normal" only.
* `ids`: Filter by script ids, invalid ids are just ignored.
         Defaults to returning all scripts.
* `includeSource`: Include `source` in the response, defaults to false
* `filter`: If this looks like a number,
            only scripts with this script id will be returned.
            This might or might not be the same
            as just passing one id into `ids`.
            If it's a string,
            it will filter scripts by if the name contains the filter.

Script types are:

* `0`: Native scripts, in bitmask: `1 << 0 = 1`
* `1`: Extension scripts, in bitmask: `bit 1 = 1 << 1 = 2`
* `2`: Normal scripts, in bitmaks `bit 2 = 1 << 2 = 4`

#### Response

Array of script mirror objects.
Descriptions where partially taken from the v8 wiki.

* `name`: name of the script
* `id`: id of the script
* `lineOffset`: line offset within the containing resource
* `columnOffset`: column offset within the containing resource
* `lineCount`: number of lines in the script
* `data`: optional data object added through the API
* `source`: source of the script if includeSource was specified in the request
* `sourceStart`: first 80 characters of the script
                 if includeSource was not specified in the request
* `sourceLength`: total length of the script in characters
* `scriptType`: script type (see request for values)
* `compilationType`: How was this script compiled.
                     0 if script was compiled through the API
                     1 if script was compiled through eval
* `evalFromScript`: if "compilationType" is 1 this is the script
                    from where eval was called
* `evalFromLocation`: `{line,column}` if "compilationType" is 1
                      this is the position in the script
                      from where eval was called
* `evalFromFunctionName`: If "compilationType" is 1 this is the function name
                          from where eval was called

#### Examples

```js
{"seq":117,"type":"request","command":"scripts"}
{"seq":118,"type":"request","command":"scripts","arguments":{"types":7}}
```


### Request `threads` - `threadsRequest_`

#### Arguments

*No arguments*

#### Response

* `totalThreads`: Number of threads
* `thread_info.id`: Id of the thread, number
* `thread_info.current`: If the thread is the current one, boolean


### Request `suspend` - `suspendRequest_`

No arguments, no response. Pauses execution.
The reverse of calling `continue` without arguments.


### Request `version` - `versionRequest_`

> The request version reports version of the running V8.

#### Response

* `V8Version`: The version of v8 the process is running

#### Examples

```js
{"seq":1,"type":"request","command":"version"}
{"seq":134,"request_seq":1,"type":"response","command":"version","success":true,"body":{"V8Version":"1.3.19 (candidate)"},"refs":[],"running":false}
```


### Request `changelive` - `changeLiveRequest_`

The juicy parts can be found in `liveedit-debugger.js`.

#### Arguments

* `script_id`: Id of the script to change
* `preview_only`: Do a dry run without actually changing the source
* `new_source`: The new source code for the script

#### Response

* `change_log`: ?
* `result.stack_modified`: Changes affect one of the current stack frames
* `result.change_tree`: Tree of changes
* `result.textual_diff.old_len`: Length of old source code
* `result.textual_diff.new_len`: Length of new source code
* `result.textual_diff.chunks`: Changed chunks
* `result.updated`: True if any change was made
* `result.created_script_name`: Sometimes the diff algorithm needs to create
                                a copy of the old script.
* `result.stack_update_needs_step_in`: Same as `stack_modified`
* `stepin_recommended`: true if `stack_update_needs_step_in`
                        and the VM isn't currently paused.
                        Will not be set for preview requests.


### Request `restartframe` - `restartFrameRequest_`

The juicy parts can be found in `liveedit-debugger.js`.

*Warning:* This is one of the few functions
where empty arguments are required to be passed in as `{}`
instead of not sending anything.

#### Arguments

* `frame`: Valid stack frame or undefined for the selected frame.

#### Response

* `result.stack_update_needs_step_in`: Always true


### Request `flags` - `debuggerFlagsRequest_`

*Warning:* This is one of the few functions
where empty arguments are required to be passed in as `{}`
instead of not sending anything.

Known flags:

* *breakPointsActive*
* *breakOnCaughtException*
* *breakOnUncaughtException*

#### Arguments

* `flags`: Pair of `name` and `value`.
           The value is optional, if it is provided the flag will be updated.
           Filters which flags are returned.
           If omitted, all flags are returned.
           Invalid or unknown flags are gracefully ignored.

#### Response

* `flags`: Array of flags, same pair of `name` and `value` as above.
           If no `flags` were passed in,
           this will return all current flag values.


### Request `v8flags` - `v8FlagsRequest_`

> The request v8flags is a request to apply the specified v8 flags (analogous to how they are specified on the command line).

*Warning:* This is one of the few functions
where empty arguments are required to be passed in as `{}`
instead of not sending anything.

#### Arguments

* `flags`: A string with command line flags, defaults to empty string.

#### Response

*No response*

#### Examples

```js
{"seq":117,"type":"request","command":"v8flags","arguments":{"flags":"--trace_gc —-always_compact"}}
{"seq":118,"type":"request","command":" v8flags","arguments":{"flags":"--notrace_gc"}}
```


### Request `gc` - `gcRequest_`

> The request gc is a request to run the garbage collector in the debuggee.
> In response, the debuggee will run the specified GC type.

*Warning:* This is one of the few functions
where empty arguments are required to be passed in as `{}`
instead of not sending anything.

#### Arguments

* `type`: Defaults to "all"

As for available types, to quote `runtime.cc`:

> Presently, it only does a full GC.

#### Response

* `before`: Heap usage before, integer
* `after`: Heap usage after, integer

#### Examples

```js
{"seq":117,"type":"request","command":"gc","arguments":{"type":"all"}}
```


## Events

Each event name is followed by the name of the event class
in `debug-debugger.js`.
The number in front is the v8-internal enum value of the event.
The representation of the event body is determined
by the method `toJSONProtocol` of the event class.

All examples omit the wrapping message and only show the `body`.
We'll also show the parsed body - JSON with slightly less quotes.
For completeness' sake here one relatively complete event frame:

```
Content-Length: 78\r\n
\r\n
{"seq":42,"type":"event","event":"beforeCompile","body":{"script":{"id":"1"}}}
```

### 1: Event `break` - `BreakEvent`

#### Event Body

* `invocationText`: Text representation of the top stack frame
* `script`: Script in which the break occured
* `sourceLineText`: Source code of the line where execution stopped
* `sourceLine`/`sourceColumn`: Position in the script
* `breakpoints`: Array of ids of breakpoints that caused the break

#### Examples

```js
{ invocationText: '#<Object>.[anonymous](exports=#<Object>, require=function require(path) {\n    return self.require(path);\n  }, module=#<Module>, __filename=/full/path/to/test/buggers/breakpoint.js, __dirname=/full/path/to/test/buggers)',
  sourceLine: 16,
  sourceColumn: 2,
  sourceLineText: '})();',
  script: 
   { id: 46,
     name: '/full/path/to/test/buggers/breakpoint.js',
     lineOffset: 0,
     columnOffset: 0,
     lineCount: 19 },
  breakpoints: [ 1 ] }
```


### 2: Event `exception` - `ExceptionEvent`

#### Event Body

* `invocationText`: Text representation of the top stack frame
* `script`: Script in which the break occured
* `sourceLineText`: Source code of the line where execution stopped
* `sourceLine`/`sourceColumn`: Position in the script.
  `sourceLine` may be -1 if there's no valid stack frame.
* `uncaught`: true if this was an uncaught exception
* `exception`: The exception object

#### Examples

```js
{ uncaught: false,
  exception: 
   { handle: 0,
     type: 'error',
     className: 'Error',
     constructorFunction: { ref: 4 },
     protoObject: { ref: 5 },
     prototypeObject: { ref: 6 },
     properties: [
      { name: 'stack', attributes: 2, propertyType: 3, ref: 6 },
      { name: 'arguments', attributes: 2, propertyType: 1, ref: 6 },
      { name: 'type', attributes: 2, propertyType: 1, ref: 6 },
      { name: 'message', attributes: 2, propertyType: 1, ref: 7 } ],
     text: 'Error: err message' },
  sourceLine: 3,
  sourceColumn: 10,
  sourceLineText: '    throw new Error(\'err message\');',
  script: 
   { id: 46,
     name: '/full/path/to/test/buggers/throws.js',
     lineOffset: 0,
     columnOffset: 0,
     lineCount: 12 } }
```


### 3: Event `?` - `NewFunctionEvent`

*Not exposed in any obvious way*


### 4: Event `beforeCompile` - `CompileEvent`

#### Event Body

*See: afterCompile*


### 5: Event `afterCompile` - `CompileEvent`

* `script`: The script that was compiled

#### Examples

```js
{ script: 
   { handle: 1,
     type: 'script',
     name: 'node.js',
     id: 30,
     lineOffset: 0,
     columnOffset: 0,
     lineCount: 903,
     sourceStart: '// Copyright Joyent, Inc. and other Node contributors.\n//\n// Permission is hereb',
     sourceLength: 28135,
     scriptType: 2,
     compilationType: 0,
     context: { ref: 0 },
     text: 'node.js (lines: 903)' } }
```


### 6: Event `scriptCollected` - `ScriptCollectedEvent`

Emitted when a script is no longer referenced and was collected.

#### Event Body

*See: afterCompile*


### 7: Event ?

*BreakForCommand, defined in v8-debug.h*


## Response object serialization

*For now see `scope`*

```js
// From mirror-debugger.js
// Mirror hierarchy:
//   - Mirror
//     - ValueMirror
//       - UndefinedMirror
//       - NullMirror
//       - NumberMirror
//       - StringMirror
//       - ObjectMirror
//         - FunctionMirror
//           - UnresolvedFunctionMirror
//         - ArrayMirror
//         - DateMirror
//         - RegExpMirror
//         - ErrorMirror
//     - PropertyMirror
//     - InternalPropertyMirror
//     - FrameMirror
//     - ScriptMirror
```

## Important links

Original author in the v8 wiki:

* https://code.google.com/u/mikhail.naganov/

Page in the v8 wiki:

* https://code.google.com/p/v8/wiki/DebuggerProtocol
