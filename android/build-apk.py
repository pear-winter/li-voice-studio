"""Build using Android SDK 35 + Eclipse ECJ (Java 17 runtime).
Set ANDROID_SDK_ROOT, ECJ_JAR, VOICE_SIGNING_DIR. Signing material stays outside this repository.
"""
import os,subprocess,shutil,zipfile
from pathlib import Path
root=Path(__file__).resolve().parent.parent
sdk=Path(os.environ['ANDROID_SDK_ROOT']);ecj=Path(os.environ['ECJ_JAR']);keys=Path(os.environ['VOICE_SIGNING_DIR'])
b=root/'android/build';b.mkdir(exist_ok=True);bt=sdk/'build-tools/35.0.0';jar=sdk/'platforms/android-35/android.jar'
def run(*args):subprocess.run([str(x) for x in args],check=True)
for d in ['classes','dex','assets/web']:(b/d).mkdir(parents=True,exist_ok=True)
exec((root/'android/prepare-web.py').read_text(),{'root':root})
for file in (root/'android/web').iterdir():
 if file.is_file():shutil.copyfile(file,b/'assets/web'/file.name)
run('java','-jar',ecj,'-nowarn','-1.8','-bootclasspath',str(jar)+':'+str(bt/'core-lambda-stubs.jar'),'-d',b/'classes',*list((root/'android/src').rglob('*.java')))
run(bt/'aapt2','compile','--dir',root/'android/res','-o',b/'res.zip')
run(bt/'aapt2','link','-o',b/'base.apk','-I',jar,'--manifest',root/'android/AndroidManifest.xml','--min-sdk-version','26','--target-sdk-version','35',b/'res.zip','-A',b/'assets')
run(bt/'d8','--lib',jar,'--min-api','26','--output',b/'dex',*list((b/'classes').rglob('*.class')))
with zipfile.ZipFile(b/'base.apk','a',compression=zipfile.ZIP_STORED) as z:
 for dex in (b/'dex').glob('*.dex'):z.write(dex,dex.name)
run(bt/'zipalign','-p','-f','4',b/'base.apk',b/'aligned.apk')
run(bt/'apksigner','sign','--ks',keys/'release.p12','--ks-key-alias','pear','--ks-pass','file:'+str(keys/'password.txt'),'--out',b/'li-voice-1.1.0.apk',b/'aligned.apk')
run(bt/'apksigner','verify','--verbose',b/'li-voice-1.1.0.apk')
print('APK:',b/'li-voice-1.1.0.apk')

