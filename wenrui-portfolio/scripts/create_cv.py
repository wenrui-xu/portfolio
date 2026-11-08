from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

OUT = Path(__file__).resolve().parents[1] / 'public' / 'resume' / 'Wenrui-Xu-CV.pdf'
FONT_DIR = Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('DejaVu', str(FONT_DIR/'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DejaVu-Bold', str(FONT_DIR/'DejaVuSans-Bold.ttf')))
W,H=A4
paper=HexColor('#F8F5ED'); ink=HexColor('#243027'); green=HexColor('#647856'); subtle=HexColor('#536053'); line=HexColor('#C9D1C1')
c=canvas.Canvas(str(OUT),pagesize=A4)
c.setTitle('Wenrui Xu | CV')
c.setAuthor('Wenrui Xu')
c.setFillColor(paper);c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(green);c.rect(0,H-14,W,14,fill=1,stroke=0)
L=47; R=W-47

def txt(x,y,s,size=10,bold=False,color=ink):
    c.setFont('DejaVu-Bold' if bold else 'DejaVu',size);c.setFillColor(color);c.drawString(x,y,s)

def section(y,title):
    txt(L,y,title.upper(),10,True,green);c.setStrokeColor(line);c.setLineWidth(.7);c.line(L,y-9,R,y-9);return y-30

def lines(x,y,strings,size=9.5,leading=15,color=subtle):
    for s in strings:txt(x,y,s,size,False,color);y-=leading
    return y

txt(L,H-64,'WENRUI XU',27,True)
txt(L,H-87,'SOFTWARE DEVELOPER  /  GAMES · ANDROID · CREATIVE TECH',10,True,green)
txt(L,H-109,'Valencia, Spain   ·   sabrina_xu@hotmail.es',9,False,subtle)
txt(L,H-126,'github.com/Alpacakohai   ·   linkedin.com/in/wenruixu',9,False,subtle)
y=H-165
y=section(y,'Profile')
y=lines(L,y,[
    'Multimedia Engineering student at the Universitat de València, focused on Unity/C#',
    'game development and native Android applications with Kotlin. I combine software,',
    'visual design, prototyping, testing and creative automation.'
],9.5,16)-13
y=section(y,'Selected work')
txt(L,y,'ADI  |  Native Android application',11,True);txt(R-86,y,'Final-year project',8,False,green);y-=18
y=lines(L,y,[
    'Designed and developed task and routine management for users with ADHD and autism.',
    'Jetpack Compose, Room, adapted modes, visual sequences, calendar and tutor controls.',
    'User testing and feedback informed navigation, voice controls and routine behavior.'
],9,15)-13
txt(L,y,'Snail Mail Club  |  Game concept',11,True);y-=18
y=lines(L,y,[
    'Solo creative game concept centered on tactile letter-making and paper crafts.',
    'Interaction design and production planning; Unity, C# and Blender are planned tools.'
],9,15)-17
y=section(y,'Experience & education')
txt(L,y,'ANIEME / Furniture from Spain',10.5,True);y-=16
y=lines(L,y,['Internship in digital content, B2B communication and process automation.'],9,15)-10
txt(L,y,'Multimedia Engineering  |  Universitat de València',10.5,True);y-=16
y=lines(L,y,['Final degree project completed; defense pending.'],9,15)-18
y=section(y,'Technical focus')
for label,value in [
    ('Development','Unity, C#, Kotlin, Android, Jetpack Compose, Python'),
    ('Design & tools','Blender, interaction design, visual prototyping'),
    ('Methods','User testing, QA fundamentals, automation, generative AI workflows')
]:
    txt(L,y,label,9,True);txt(L+116,y,value,9,False,subtle);y-=22
c.setStrokeColor(line);c.line(L,49,R,49)
txt(L,34,'Wenrui Xu  ·  Portfolio CV',8,False,subtle)
txt(R-88,34,'Updated 2026',8,False,subtle)
c.showPage();c.save()
print(OUT)
