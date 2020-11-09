---
title: cowboy websocket (boardcast)
date: 2020-11-09 16:25:23
categories: 
- erlang
tags:
- web
---


### websocket连接管理,这里存储在ets里面:
``` erlang
-module (gate_cb).
-export ([init/0, add/1, lookup/0, remove/1, dispose/0]).

init() ->
%% 注意public，否则只能在主线程添加和删除
	ets:new(gate_conn, [bag, public, named_table]). 

add( Pid ) when is_pid(Pid) ->
	ets:insert(gate_conn, { gate, Pid }).

lookup() ->
	ets:lookup(gate_conn, gate).

remove( Pid ) when is_pid(Pid) ->
	ets:delete_object(gate_conn, {gate, Pid}).

dispose() ->
	ets:delete(gate_conn).
```

### websocket 回调模块:
``` erlang
-module(ws_h).

-export([init/2]).
-export([websocket_init/1]).
-export([websocket_handle/2]).
-export([websocket_info/2]).
% -export ([websocket_terminate/3]).
-export ([terminate/3]).

init(Req, Opts) ->
	#{pid := Pid} = Req,
	gate_cb:add(Pid),
	{cowboy_websocket, Req, Opts}.

websocket_init(State) ->
	{[{text, <<"Immediately Hello!">>}], State}.

websocket_handle({text, Msg}, State) ->
	lists:foreach(
		fun({_, CurrPid}) -> 
			CurrPid ! { chat, <<"Boardcast message: ", Msg/binary>> }
		end,
		gate_cb:lookup()
		),
	{[], State};

websocket_handle(_Data, State) ->
	{[], State}.

websocket_info({chat, Msg}, State)->
	io:format("chat ~w~n", [Msg]),
    {[{text,Msg}], State};

websocket_info({timeout, _Ref, Msg}, State) ->
	erlang:start_timer(1000, self(), <<"How' you doin'?">>),
	{[{text, Msg}], State};

websocket_info(_Info, State) ->
	{[], State}.
 
terminate(Reason, PartialReq, State) ->
	io:format("terminate Reason: ~w, PartialReq: ~w, State: ~w , Pid: ~w ~n", [Reason, PartialReq, State, self()]),
	gate_cb:remove(self()),
	% case Reason of
	% 	{remote, 1001, _} ->	
	% 		io:format("refresh.~n");
	% 	{timeout} ->
	% 		io:format("timeout.~n");
	% 	{error, closed} ->
	% 		io:format("closed page.~n")
	% end,
	ok.
```

### 最后别忘了在启动时初始化:
``` erlang
	... ...
	Dispatch = cowboy_router:compile([
        {'_', [
            % {"/", hello_handler, []},
            {"/", cowboy_static, {file, "static/ws.html"}},
            {"/websocket", ws_h, []}
            ]}
    ]),
    gate_cb:init(),
    persistent_term:put(my_app_dispatch, Dispatch),
    ... ...
```