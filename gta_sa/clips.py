# Нарезка клипов для ролика: имя, исходник, начало (с), длительность (с). Кадры jpg 30 к/с 960x540 -> clips/<имя>/
import subprocess, os, sys
CLIPS = [
 ('lv_drive','lv_ps2',6,8), ('lv_strip','lv_ps2',60,8), ('lv_peds','lv_ps2',102,8), ('lv_desert','lv_ps2',246,8), ('lv_neon','lv_ps2',300,8), ('swim','lv_ps2',180,8),
 ('ls_sunset','m10_cesar',88,8), ('ls_drive','m10_cesar',104,8), ('ls_street','m10_cesar',256,8), ('tune','m10_cesar',168,8), ('lowrider','m10_cesar',328,8),
 ('fields','m37_san_fierro',104,8), ('fields_sun','m37_san_fierro',216,8), ('country','m37_san_fierro',320,8), ('forest','m37_san_fierro',360,8), ('fog_night','m37_san_fierro',424,8), ('sf_city','m37_san_fierro',536,8),
 ('plane_takeoff','m65_noe',90,8), ('plane_sea','m65_noe',120,8), ('plane_fog','m65_noe',150,8), ('plane_trees','m65_noe',232,8), ('plane_canyon','m65_noe',400,8),
 ('desert_drive','m80_misappropriation',130,8), ('dunes','m80_misappropriation',143,8), ('desert_hw','m80_misappropriation',195,8), ('desert_sunset','m80_misappropriation',222,8),
 ('coop1','coop',50,8), ('coop2','coop',120,8), ('coop3','coop',340,8), ('coop4','coop',550,8),
 ('marker','ps2_gameplay',866,8), ('burger','ps2_gameplay',930,8), ('grove','ps2_gameplay',423,8), ('traffic','ps2_gameplay',1830,8), ('ls_haze','ps2_gameplay',2010,8), ('rails','ps2_gameplay',3106.5,8),
 ('bmx','bmx',6,8), ('gym','gym',5,8), ('haircut','haircut',30,8), ('yellow','haircut',11,8), ('fat','body',4,8), ('muscle','body',32,8),
]
only = set(sys.argv[1:])
for name, src, st, du in CLIPS:
    if only and name not in only: continue
    d = f'clips/{name}'
    if os.path.exists(f'{d}/0001.jpg') and not only: continue
    os.makedirs(d, exist_ok=True)
    vf = 'fps=30,scale=960:540:force_original_aspect_ratio=increase,crop=960:540'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(st), '-i', f'src/{src}.mp4', '-t', str(du), '-vf', vf, '-q:v', '3', f'{d}/%04d.jpg'], check=True)
    print(name, len(os.listdir(d)))
