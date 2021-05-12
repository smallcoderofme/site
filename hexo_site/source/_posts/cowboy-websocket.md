---
title: cowboy websocket (boardcast)
date: 2020-11-09 16:25:23
categories: 
- Erlang
tags:
- Web
---


### websocket连接管理,这里存储在ets里面:
``` erlang
-module (conn_ets).
-export ([init/0, insert/2, lookup/1, remove_by_id/1, remove_by_pid/1, get_online_num/0]).

-define(TABLE_ID, ?MODULE).

init() ->
	ets:new(?TABLE_ID, [bag, public, named_table]),
	ok.

%% login success insert id and pid.
insert( GId, Pid ) when is_pid(Pid) ->
	ets:insert(?TABLE_ID, { GId, Pid }).

lookup(GId) ->
	ets:lookup(?TABLE_ID, GId).

%% get pid by id
% lookup(GId) ->
% 	case ets:lookup(?TABLE_ID, GId) of
% 		[{GId, Pid}] -> {ok, {GId, Pid}};
% 		[]			-> {error, not_found}
% 	end.

%% logout remove online user
remove_by_id(GId) ->
	ets:match_delete(?TABLE_ID, {GId, '_'}).

remove_by_pid(Pid) ->
    ets:match_delete(?TABLE_ID, {'_', Pid}).

get_online_num() ->
	length(ets:tab2list(?TABLE_ID)).
```

### websocket 回调模块:
``` erlang
-module(ws_h).

-export([init/2]).
-export([websocket_init/1]).
-export([websocket_handle/2]).
-export([websocket_info/2]).
-export([terminate/3]).

% -record(state, {pid, id}).

init(Req, Opts) ->
	#{pid := Pid} = Req,
	conn_ets:insert("chat_room", Pid),
	{cowboy_websocket, Req, Opts}.

websocket_init(State) ->
	% erlang:start_timer(1000, self(), <<"Hello!">>),
	{[{text, <<"Immediately Hello!">>}], State}.
	% self()! {[{text, <<"Hello Response">>}], State},
	% {[], State}.

websocket_handle({text, Msg}, State) ->
	lists:foreach(
		fun({_, CurrPid}) -> 
			% io:format("Boardcast: ~w ~n", [CurrPid])
			CurrPid ! { chat, <<"Boardcast message: ", Msg/binary>> }
		end,
		conn_ets:lookup("chat_room")
		),
	% io:format("Terminate reason: ~w ~n", [conn_ets:lookup("chat_room")]),
	% self() ! { chat, <<"Boardcast message: ", Msg/binary>> },
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
 
terminate(Reason, _PartialReq, _State) ->
	io:format("Terminate reason: ~w ~w ~n", [Reason, self()]),
	conn_ets:remove_by_pid(self()),
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
-module(chess_app_app).
-behaviour(application).

-export([start/2]).
-export([stop/1]).

start(_Type, _Args) ->
	conn_ets:init(),
    Dispatch = cowboy_router:compile([
        {'_', [
                {"/", home_handler, []},
%%                 {"/[...]", cowboy_static, {dir, "priv/"}},
                {"/index", cowboy_static, {file, "priv/index.html"}},
                {"/ws", cowboy_static, {file, "priv/ws.html"}},
                {"/websocket", ws_h, []}
                ]}
    ]),
    {ok, _} = cowboy:start_clear(my_http_listener,
        [{port, 8080}],
        #{env => #{dispatch => Dispatch}}
    ),
    chess_app_sup:start_link().

stop(_State) ->
	ok.
```