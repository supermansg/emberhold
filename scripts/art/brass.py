"""Offline Brass art source. Blender 4.3: blender -b -t 2 -P scripts/art/brass.py
Model coordinates: X right, Y forward, Z up. glTF export converts to Y up.
No runtime generation, third-party art, simulation data, or downloaded models.
"""
import bpy, math, os
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
def mat(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 return m
bronze=mat('Hammered bronze',(.48,.235,.055),.72,.36)
gold=mat('Machined brass edges',(.82,.48,.13),.78,.29)
steel=mat('Blued cannon steel',(.065,.085,.105),.8,.32)
leather=mat('Oiled dark leather',(.10,.045,.022),0,.78)
skin=mat('Warm skin',(.88,.52,.29),0,.62)
hair=mat('Copper red hair',(.48,.062,.016),0,.64)
white=mat('Ivory',(.92,.87,.71),0,.4)
black=mat('Pupils and barrel bores',(.008,.012,.016),.1,.4)
glass=mat('Teal glass',(.025,.29,.34),.55,.19)
def group(name,parent=None,loc=(0,0,0)):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent;o.location=loc;return o
root=group('Brass');body=group('Body',root);head=group('Head',body,(0,0,1.88));weapon=group('Weapon',body,(0,.48,1.03))
legs=[group('LegL',body,(-.32,0,.66)),group('LegR',body,(.32,0,.66))]
arms=[group('ArmL',body,(-.57,0,1.37)),group('ArmR',body,(.57,0,1.37))]
def mesh(name,verts,faces,material,parent):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.parent=parent;o.data.materials.append(material)
 for p in me.polygons:p.use_smooth=True
 return o
def ell(name,loc,scale,material,parent,seg=16,rings=10):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=(0,0,0));o=bpy.context.object;o.name=name;o.parent=parent;o.location=loc;o.scale=scale;o.data.materials.append(material)
 for p in o.data.polygons:p.use_smooth=True
 return o
def plate(name,loc,scale,material,parent,bevel=.07):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=name;o.parent=parent;o.location=loc;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 b=o.modifiers.new('Forged edge','BEVEL');b.width=bevel;b.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
 n=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=n.name)
 return o
def tube(name,path,radii,material,parent,sides=10):
 # Swept circular sections perpendicular to a varying centerline, for carved locks/tubes.
 verts=[]
 for i,p in enumerate(path):
  tangent=Vector(path[min(i+1,len(path)-1)])-Vector(path[max(0,i-1)])
  tangent.normalize();u=tangent.cross(Vector((0,1,0)))
  if u.length<.01:u=tangent.cross(Vector((1,0,0)))
  u.normalize();v=tangent.cross(u)
  for j in range(sides):
   q=Vector(p)+radii[i]*(u*math.cos(j*math.tau/sides)+v*math.sin(j*math.tau/sides));verts.append(q[:])
 faces=[]
 for i in range(len(path)-1):
  for j in range(sides):faces.append((i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+(j+1)%sides,(i+1)*sides+j))
 faces.extend([tuple(reversed(range(sides))),tuple((len(path)-1)*sides+j for j in range(sides))]);return mesh(name,verts,faces,material,parent)
def bore(name,x,y,z,r,length,material,parent):
 # Real hollow octagonal muzzle, inner wall and rim, closed dark breech.
 sides=12;verts=[]
 for yy,rr in [(y,r),(y+length,r),(y+length,r*.72),(y+.07,r*.72)]:
  for j in range(sides):a=j*math.tau/sides;verts.append((x+rr*math.cos(a),yy,z+rr*math.sin(a)))
 faces=[]
 for k in range(3):
  for j in range(sides):faces.append((k*sides+j,k*sides+(j+1)%sides,(k+1)*sides+(j+1)%sides,(k+1)*sides+j))
 o=mesh(name,verts,faces,material,parent)
 for p in o.data.polygons:p.use_smooth=False
 return o
# Torso: overlapping breastplate, collar and a visible leather under-suit.
ell('Suit',(0,0,1.18),(.53,.32,.52),leather,body)
ell('Forged breastplate',(0,.055,1.27),(.55,.32,.43),bronze,body)
plate('Chest center',(0,.335,1.28),(.45,.075,.45),gold,body,.035)
plate('Belt',(0,.015,.83),(1,.58,.14),leather,body,.06)
plate('Buckle',(0,.32,.83),(.2,.07,.18),gold,body,.025)
# Backpack furnace integrated behind shoulders, hoses follow its sides.
plate('Backpack',(0,-.4,1.3),(.77,.36,.81),bronze,body,.10)
for s in [-1,1]:
 tube('Steam pipe',[(s*.29,-.48,1.3),(s*.37,-.49,1.62),(s*.36,-.48,1.94)],[.095,.095,.075],steel,body)
 bore('Pipe lip',s*.36,-.56,1.94,.105,.13,gold,body)
 tube('Pressure hose',[(s*.34,-.57,1.05),(s*.55,-.43,1.08),(s*.59,-.18,1.3)],[.055,.055,.055],leather,body)
ell('Furnace',(0,-.596,1.32),(.21,.035,.25),gold,body)
# Stance: anatomical transitions and articulated boots, knees, layered shoulders.
for i,s in enumerate([-1,1]):
 l=legs[i];ell('Thigh',(0,0,-.03),(.205,.225,.31),leather,l)
 plate('Thigh armor',(0,.13,-.03),(.33,.16,.34),bronze,l,.07)
 ell('Knee',(0,.145,-.23),(.19,.16,.18),gold,l)
 plate('Greave',(0,.05,-.4),(.30,.32,.31),bronze,l,.08)
 plate('Boot sole',(0,.10,-.595),(.42,.62,.12),leather,l,.05)
 ell('Armored toe',(0,.23,-.50),(.225,.34,.17),bronze,l)
 a=arms[i];ell('Shoulder',(0,0,.02),(.31,.29,.29),bronze,a)
 plate('Shoulder rim',(s*.04,.005,.11),(.46,.49,.14),gold,a,.055)
 ell('Elbow',(s*.015,.09,-.28),(.16,.175,.17),steel,a)
 ell('Forearm',(s*.01,.21,-.34),(.185,.27,.185),leather,a)
 plate('Gauntlet',(s*.01,.28,-.30),(.32,.31,.16),bronze,a,.05)
 ell('Glove',(s*-.035,.42,-.31),(.18,.18,.17),leather,a)
 for j in range(3):tube('Fingers',[(s*-.07+j*.065,.47,-.26),(s*-.07+j*.065,.56,-.33),(s*-.07+j*.065,.49,-.40)],[.042,.043,.035],leather,a,6)
 for x in [-.13,.13]:ell('Shoulder rivet',(x,.25,.1),(.04,.027,.04),gold,a,8,6)
# Face with inset whites, brows, projecting nose and coherent swept beard.
ell('Face',(0,.045,.06),(.395,.305,.40),skin,head)
for s in [-1,1]:
 ell('Ear',(s*.38,.01,.055),(.105,.075,.15),skin,head)
 ell('Eye socket',(s*.145,.309,.10),(.14,.035,.12),hair,head)
 ell('Eye',(s*.145,.331,.10),(.112,.028,.09),white,head)
 ell('Pupil',(s*.132,.358,.10),(.038,.012,.055),black,head,12,8)
 ell('Eye glint',(s*.132-.009,.369,.119),(.012,.006,.016),white,head,8,6)
 tube('Brow',[(s*.045,.35,.205),(s*.14,.36,.23),(s*.255,.32,.215)],[.047,.06,.025],hair,head)
ell('Nose',(0,.355,-.015),(.115,.105,.10),skin,head)
# Beard strands overlap in depth, curve outwards then tuck in, no disconnected beads.
for j in range(9):
 x=(j-4)*.078;length=.34-.1*abs(x)/.32
 tube('Carved beard',[(x,.28,-.06),(x*1.13,.36,-.20),(x*.97,.32,-.20-length),(x*.75,.25,-.25-length)],[.09,.095,.075,.009],hair,head,9)
for s in [-1,1]:tube('Moustache',[(s*.035,.41,-.055),(s*.15,.425,-.09),(s*.30,.34,-.14),(s*.33,.28,-.10)],[.065,.084,.055,.006],hair,head)
# Scalp and swept locks, goggle strap, actual lenses.
ell('Hair cap',(0,-.015,.32),(.4,.31,.24),hair,head)
for j in range(7):
 x=(j-3)*.10;tube('Swept hair',[(x,-.03,.39),(x+.035,-.06,.54),(x+.055,-.13,.68-.10*abs(j-3))],[.115,.09,.003],hair,head,9)
plate('Goggle strap',(0,.235,.32),(.74,.13,.105),leather,head,.04)
for s in [-1,1]:
 bore('Goggle rim',s*.19,.23,.37,.145,.07,gold,head)
 ell('Lens',(s*.19,.306,.37),(.116,.024,.116),glass,head)
 ell('Lens glint',(s*.19-.028,.329,.409),(.04,.009,.017),white,head,8,6)
# Oversized paired cannon. Mantlet joins hands rather than hovering.
plate('Receiver',(0,.06,0),(.84,.64,.43),steel,weapon,.07)
plate('Armored mantlet',(0,.16,.16),(.89,.65,.16),bronze,weapon,.055)
plate('Breech brace',(0,-.19,0),(.90,.11,.48),gold,weapon,.03)
for s in [-1,1]:
 bore('Barrel',s*.235,.12,0,.20,.98,steel,weapon)
 bore('Muzzle crown',s*.235,.95,0,.235,.19,gold,weapon)
 for y in [.34,.68]:bore('Barrel band',s*.235,y,0,.218,.07,bronze,weapon)
 ell('Dark breech',(s*.235,.2,0),(.144,.015,.144),black,weapon)
 for y in [-.15,.15]:ell('Receiver bolt',(s*.46,y,.08),(.032,.045,.045),gold,weapon,8,6)
group('Muzzle',weapon,(0,1.16,0))
group('HeadSocket',head,(0,0,.65))
# Join meshes by articulation group/material. Keeps sockets and hierarchy, bounds draw calls.
for parent in [body,head,weapon,*legs,*arms]:
 for material in list(bpy.data.materials):
  objs=[o for o in list(parent.children) if o.type=='MESH' and o.data.materials[0]==material]
  if not objs:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in objs:o.select_set(True)
  bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();objs[0].name=parent.name+'_'+material.name
# Rotate to game forward +Z after glTF Y-up conversion.
root.rotation_euler.z=math.pi
# Export only the actor, no lights/camera.
os.makedirs(ROOT+'/dist/assets/models',exist_ok=True)
bpy.ops.export_scene.gltf(filepath=ROOT+'/dist/assets/models/brass.glb',export_format='GLB',export_yup=True,export_animations=False)
print('Brass triangles:',sum(len(p.vertices)-2 for o in bpy.data.objects if o.type=='MESH' for p in o.data.polygons))
