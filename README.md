# bugger-v8-client

Wonder what this thing does.


## Low-Level Commands

The name of the command is followed by the name of function in
`src/debug-debugger.js` that handles the command.
Most filenames in this section reference the v8 codebase.

The textual descriptions are taken mostly from https://code.google.com/p/v8/wiki/DebuggerProtocol. They are marked by the use of blockquote.

### continue - `continueRequest_`

> The request continue is a request from the debugger to start the VM running again.
> As part of the continue request the debugger can specify if it wants the VM to perform a single step action.
>
> In the response the property running will always be true as the VM will be running after executing the continue command.
> If a single step action is requested the VM will respond with a break event after running the step.

*Warning:* There's some magic going on in the v8 debugger where the
non-presence of `arguments` is not the same as an empty arguments
object.
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


### break - `breakRequest_`

Seems to be doing nothing. Quote:

> Ignore as break command does not do anything when broken.


### setbreakpoint - `setBreakPointRequest_`

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


### setexceptionbreak - `setExceptionBreakRequest_`

> The request setexceptionbreak is a request to enable/disable breaks on all / uncaught exceptions.
> If the "enabled" argument is not specify,
> the debuggee will toggle the state of the specified break type.

#### Arguments

* `type`: Either "all" or "uncaught", required
* `enabled`: Defaults to the opposite of whatever the current state is

#### Response

`type` and `enabled`. If enabled wasn't passed in, the response can be used
to detect the current status.


### changebreakpoint - `changeBreakPointRequest_`

> The request changebreakpoint changes the status of a break point.

#### Arguments

* `breakpoint`: Breakpoint id, number
* `enabled`: Optional, enable or disable the breakpoint
* `condition`: Optional, change the condition
* `ignoreCount`: Optional, reset the ignore count

#### Response

*Empty response*


### clearbreakpoint - `clearBreakPointRequest_`

> The request clearbreakpoint clears a break point.

#### Arguments

* `breakpoint`: Breakpoint id, number

#### Response

* `breakpoint`: Breakpoint id, number


### clearbreakpointgroup - `clearBreakPointGroupRequest_`

#### Arguments

* `groupId`: Breakpoint group id, number

#### Response

* `breakpoints`: Array of cleared breakpoint ids


### listbreakpoints - `listBreakpointsRequest_`

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


### disconnect - `disconnectRequest_`

> The request disconnect is used to detach the remote debugger from the debuggee.
> This will trigger the debuggee to disable all active breakpoints and resumes execution if the debuggee was previously stopped at a break.

Disable all breakpoints and continue.

#### Arguments

All arguments that are valid for `continue` will work
though anything but no arguments could be pretty confusing.

#### Response

*Empty response*


### backtrace - `backtraceRequest_`

The request backtrace returns a backtrace (or stacktrace) from the current execution state.
When issuing a request a range of frames can be supplied.
The top frame is frame number 0.
If no frame range is supplied data for 10 frames will be returned.

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


### frame - `frameRequest_`

The request frame selects a new selected frame and returns information for that.
If no frame number is specified the selected frame is returned.

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

```
var ScopeType = { Global: 0,
                  Local: 1,
                  With: 2,
                  Closure: 3,
                  Catch: 4,
                  Block: 5 };
```

*Reference: JSONProtocolSerializer.serializeFrame_*


### scopes - `scopesRequest_`


### scope - `scopeRequest_`


### setVariableValue - `setVariableValueRequest_`


### evaluate - `evaluateRequest_`


### lookup - `lookupRequest_`


### references - `referencesRequest_`


### source - `sourceRequest_`


### scripts - `scriptsRequest_`


### threads - `threadsRequest_`


### suspend - `suspendRequest_`


### version - `versionRequest_`

> The request version reports version of the running V8.


### changelive - `changeLiveRequest_`


### restartframe - `restartFrameRequest_`


### flags - `debuggerFlagsRequest_`


### v8flags - `v8FlagsRequest_`

> The request v8flags is a request to apply the specified v8 flags (analogous to how they are specified on the command line).


### gc - `gcRequest_`

> The request gc is a request to run the garbage collector in the debuggee.
> In response, the debuggee will run the specified GC type.


https://code.google.com/p/v8/wiki/DebuggerProtocol

src/debug-debugger.js in v8
