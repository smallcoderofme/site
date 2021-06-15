---
title: Socket in Erlang and C#
date: 2021-06-15 11:04:15
categories: 
- Game Dev
---

### Server Code (Client)


``` CSharp

[Serializable]
public class BaseData
{
    public int command;
}

[Serializable]
public class JoinRoom: BaseData
{
    public string id; // user id
    public string room_id;
}

public void Connect()
{
	JoinRoom jr = new JoinRoom()
	{
	    command = 1001,
	    room_id = "ess33424",
	    id = "s15512",
	};
	/** HEAD 可以用来定义服务器的通讯协议版本号或直接用作协议指令。或者同时定义两者 */
	byte[] HEAD = { 131, 107, 0, 5 };
	byte[] BODY = Encoding.UTF8.GetBytes(JsonUtility.ToJson(jr));
	byte[] MESSAGE = new byte[HEAD.Length + BODY.Length];
	SendBytes(MESSAGE);
}


public void SendBytes(byte[] msg)
{
    NetworkStream stream = Client.GetStream();
    stream.Write(msg, 0, msg.Length);
}

```

### Server Code(Erlang)
*[Sample Code：Erlang Socket Server](https://github.com/smallcoderofme/Queen.git)*
``` erlang

handle_info({inet_async, Sock, Ref, {ok, DataBin}}, State) ->
	io:format("recv: ~p ~n", [DataBin]),
	<<H1:8, H2:8, H:8, H4:8, Rest/binary>> = DataBin,
	io:format("msg: ~p ~n", [Rest]),
	gen_tcp:send(Sock, Rest),
	{noreply, State};

```
