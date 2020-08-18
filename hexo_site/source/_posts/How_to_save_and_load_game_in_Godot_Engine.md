---
title: How to save and load game in Godot Engine
date: 2020-08-18 11:13:29
---

*[原文地址：How to save and load game in Godot Engine](http://codetuto.com/2017/08/save-load-game-godot-engine/)*

### 创建两个 AutoLoad gdscript 脚本文件

Save the file into **res://autoload/user_data_manager.gd**
Use the same process **to create another script res://autoload/game_manager.gd**

Browse our two scripts and set their names as shown below.

**set scripts as autoload**
<img src="/myblogs.github.io/2020/08/18/How_to_save_and_load_game_in_Godot_Engine/set-scripts-as-autoload.png">

To save and load game in Godot engine, we need to create some scripts. We will create this once and can be used in all of our game. So let us jump into scripting.

### User Data Manager and Game Manager scripting
The user_data_manager.gd script looks like:

``` python
extends Node2D
signal loaded
signal version_mismatch
const LOADED = "loaded"
const VERSION_MISMATCH = "version_mismatch"
var _path = "path/to/save/data.dat" #Change this to user://data.dat after testing
var _user_data = {}
func load_data(default_data, version):
    _user_data["version"] = version
    _user_data["data"] = default_data
    var f = File.new()
    if(not f.file_exists(_path)):
        save_data()
    f.open(_path, File.READ)
    var loaded_data = {}
    loaded_data.parse_json(f.get_as_text())
    _parse_loaded_data(loaded_data)
    f.close()
func _parse_loaded_data(loaded_data):
    var loaded_version = loaded_data.version
    for key in loaded_data.data.keys():
        _user_data["data"][key] = loaded_data["data"][key]
    if(loaded_version != _user_data.version):
        emit_signal(VERSION_MISMATCH,loaded_version,loaded_data.data)
    else:
        emit_signal(LOADED)
func save_corrected_data(corrected_user_data):
    _user_data["data"] = corrected_user_data
    save_data()
func update_version(version):
    _user_data["version"] = version
    save_data()
func save_data():
    var f = File.new()
    f.open(_path,File.WRITE)
    f.store_string(_user_data.to_json())
    f.close()
func set_data(key,value):
    _user_data["data"][key] = value
func get_data(key):
    return _user_data["data"][key]
```

To understand the above script we have to look into the game_manager.gd script:

``` python
extends Node2D
var _default_user_data = {
    score = 0
}
func _ready():
    UserDataManager.connect(UserDataManager.LOADED,self,"init")
    UserDataManager.connect(UserDataManager.VERSION_MISMATCH,self,"_user_data_version_mismatch")
    UserDataManager.load_data(_default_user_data,"0.0.1");
func _user_data_version_mismatch(loaded_version,loaded_data):
#    Check loaded_version, parse loaded_data and update the savedata
#    UserDataManager.save_corrected_data(corrected_data)
#    Then update the new version
#    UserDataManager.update_version("0.0.2")
    init()
func init():
    print("INIT")
    pass
```

Singleton in Godot is auto instantiated and available to every script by the name we set in the project settings. We have two Singleton objects now – UserDataManager and GameManager. Both can be accessed from any other script we are going to write for our game.

We have a default user data variable. This is a dictionary object. If there is no save data present when the game starts, this default data is used. In fact, it goes deeper, even if the loaded data has no records for a specified key then the value from this default data is used. This is possible when we update our game and has additional values to be saved.

When our game boots up, UserDataManager’s load_data method is called with the default data and a version string. This version string can be in any format but it should represent our game version somehow. The UserDataManager will load the save data from the disk. If there is no save data present, it creates a new one with the specified version. If our current game version is different than the one in the saved file, the version mismatch function is called. This is the place to write logic to convert the old user data format to the new one.

That’s it. We can initialize everything in the init() and UserDataManager will manage the saving and loading of our game.

This is how you save and load game in Godot Engine.

When we want to save any data we can call,

``` python
UserDataManager.set_data("health",75)
UserDataManager.set_data("coins",100)
UserDataManager.save_data()
```

And to get something,
``` python
var player_health = UserDataManager.get_data("health")
```

Calling the above methods will work from any script and returns the value from our saved data. The above script will only work on 2.1.x versions of Godot engine. Godot 3.0 is just around the corner and scripting API is different for the Dictionary class. We will check it out when it is released.

If you really need an explanation for the user_data_manager.gd, let me know in the comments below. Thanks for reading.