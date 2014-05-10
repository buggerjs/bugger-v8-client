# bugger-v8-client

Wonder what this thing does.


## Low-Level Commands

The name of the command is followed by the name of function in
`src/debug-debugger.js` that handles the command.
Most filenames in this section reference the v8 codebase.

### `continue`: `continueRequest_`

*Warning:* There's some magic going on in the v8 debugger where the
non-presence of `arguments` is not the same as an empty arguments
object.
Also even though it looks like the handler for `continue` doesn't do anything
when no arguments are passed in,
the fact that it is setting `response.running` to true will magically resume
execution.

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


### `break`: `breakRequest_`


### `setbreakpoint`: `setBreakPointRequest_`


### `changebreakpoint`: `changeBreakPointRequest_`


### `clearbreakpoint`: `clearBreakPointRequest_`


### `clearbreakpointgroup`: `clearBreakPointGroupRequest_`


### `disconnect`: `disconnectRequest_`


### `setexceptionbreak`: `setExceptionBreakRequest_`


### `listbreakpoints`: `listBreakpointsRequest_`


### `backtrace`: `backtraceRequest_`


### `frame`: `frameRequest_`


### `scopes`: `scopesRequest_`


### `scope`: `scopeRequest_`


### `setVariableValue`: `setVariableValueRequest_`


### `evaluate`: `evaluateRequest_`


### `lookup`: `lookupRequest_`


### `references`: `referencesRequest_`


### `source`: `sourceRequest_`


### `scripts`: `scriptsRequest_`


### `threads`: `threadsRequest_`


### `suspend`: `suspendRequest_`


### `version`: `versionRequest_`


### `changelive`: `changeLiveRequest_`


### `restartframe`: `restartFrameRequest_`


### `flags`: `debuggerFlagsRequest_`


### `v8flags`: `v8FlagsRequest_`


### `gc`: `gcRequest_`


https://code.google.com/p/v8/wiki/DebuggerProtocol

src/debug-debugger.js in v8
