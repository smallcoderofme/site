---
title: Blender Python API Render And Output
date: 2021-05-11 11:06:46
categories:
- Game Dev
---
*利用Python实现在Blender中自动导出所有相机角度下的Action。*

``` python
import bpy
from os.path import join

CAMERA_FRONT = "Front"
CAMERA_BACK = "Back"
CAMERA_LEFT = "Slide.L"
CAMERA_RIGHT = "Slide.R"

CHARACTER_NAME = "character_test"

ROOT_OUTPUT_FOLDER = "C:/tmp/"

TOTAL_FRAMES = 11 #(0~10)

BATTLE_ANIMATION_ACTIONS = ["atk", "be_hit", "die", "idle", "skill"]
MOVE_ANIMATION_ACTION = "run"

CURRENT_SCENE = bpy.context.scene

def render_animate(middle_path):
	current_folder = ROOT_OUTPUT_FOLDER + middle_path
	for f in range(TOTAL_FRAMES):
		CURRENT_SCENE.frame_set(f)
		if f < 10:
			file_name = "000{}".format(f)
		else:
			file_name = "00{}{}".format(1, f%10)
		# file_name += scene.render.file_extension
		file_name += ".png"
		bpy.context.scene.render.filepath = join(current_folder, file_name)
		bpy.ops.render.render(write_still = True)


def generate_battle():
	''' left '''
	target_camera = bpy.data.objects[CAMERA_RIGHT]
	bpy.context.scene.camera = target_camera
	for action in BATTLE_ANIMATION_ACTIONS:
		temp_battle = CHARACTER_NAME + "/battle/left/l_" + action + "/"
		bpy.context.object.animation_data.action = bpy.data.actions.get(action)
		render_animate(temp_battle)
	''' right '''
	target_camera = bpy.data.objects[CAMERA_LEFT]
	bpy.context.scene.camera = target_camera
	for action in BATTLE_ANIMATION_ACTIONS:
		temp_battle = CHARACTER_NAME + "/battle/right/" + action + "/"
		bpy.context.object.animation_data.action = bpy.data.actions.get(action)
		render_animate(temp_battle)


def generate_move():
	bpy.context.object.animation_data.action = bpy.data.actions.get(MOVE_ANIMATION_ACTION)
	
	target_camera = bpy.data.objects[CAMERA_FRONT]
	bpy.context.scene.camera = target_camera
	temp_battle = CHARACTER_NAME + "/move/down/"
	render_animate(temp_battle)

	target_camera = bpy.data.objects[CAMERA_BACK]
	bpy.context.scene.camera = target_camera
	temp_battle = CHARACTER_NAME + "/move/up/"
	render_animate(temp_battle)

	target_camera = bpy.data.objects[CAMERA_RIGHT]
	bpy.context.scene.camera = target_camera
	temp_battle = CHARACTER_NAME + "/move/left/"
	render_animate(temp_battle)

	target_camera = bpy.data.objects[CAMERA_LEFT]
	bpy.context.scene.camera = target_camera
	temp_battle = CHARACTER_NAME + "/move/right/"
	render_animate(temp_battle)

generate_battle()
generate_move()
```