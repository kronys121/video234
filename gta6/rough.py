# Черновой монтаж: планы из shots/ встык под голос + реклама ggsel на своём месте. 720p для просмотра.
#   python3 rough.py -> out/gta6_rough_720p.mp4
import os, subprocess, glob, json
HERE = os.path.dirname(os.path.abspath(__file__))
from edl import shots
S = shots()
os.makedirs(f'{HERE}/out', exist_ok=True)
AD_AT = json.load(open(f'{HERE}/ad/placement.json'))['insert_at']
lst = f'{HERE}/out/concat.txt'
with open(lst, 'w') as f:
    for i, s in enumerate(S):
        if abs(s['t'] - AD_AT) < 0.01:
            f.write(f"file '{HERE}/out/ad_720.mp4'\n")
        f.write(f"file '{HERE}/shots/{i:03d}_{s['name']}.mp4'\n")
# реклама: только видео, 720p60
subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', f'{HERE}/ad/gta6_ggsel.mp4', '-vf', 'scale=1920:1080,fps=60,format=yuv420p,setsar=1', '-an',
                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', f'{HERE}/out/ad_720.mp4'], check=True)
AD = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{HERE}/ad/gta6_ggsel.mp4']))
# звук: голос до рекламы + звук рекламы + голос после
subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', f'{HERE}/voice/gta6_voice_main.mp3', '-i', f'{HERE}/ad/gta6_ggsel.mp4', '-filter_complex',
                f'[0:a]atrim=0:{AD_AT},asetpts=PTS-STARTPTS,aresample=48000[a0];[1:a]aresample=48000,asetpts=PTS-STARTPTS[a1];'
                f'[0:a]atrim=start={AD_AT},asetpts=PTS-STARTPTS,aresample=48000[a2];[a0][a1][a2]concat=n=3:v=0:a=1[a]',
                '-map', '[a]', '-c:a', 'pcm_s16le', f'{HERE}/out/rough_audio.wav'], check=True)
subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', f'{HERE}/out/rough_audio.wav',
                '-vf', 'scale=1280:720:flags=bicubic,fps=30', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', f'{HERE}/out/gta6_rough_720p.mp4'], check=True)
print('ok', AD)
