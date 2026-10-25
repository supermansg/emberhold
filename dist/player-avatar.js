const TYPES=new Set(['image/png','image/jpeg','image/webp']);
export async function prepareAvatar(file){
 if(!file||!TYPES.has(file.type)||file.size>2*1024*1024)throw Error('בחרו תמונת PNG, JPG או WebP עד 2MB.');
 const bitmap=await createImageBitmap(file);
 try{
  if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>24e6)throw Error('התמונה גדולה מדי.');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d'),side=Math.min(bitmap.width,bitmap.height);
  ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,256,256);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.85));
  if(!blob||blob.size>256*1024)throw Error('לא ניתן להכין את התמונה להעלאה.');return blob;
 }finally{bitmap.close();}
}
export async function getAvatar(client,id){
 const {data,error}=await client.from('player_profiles').select('avatar_kind,avatar_path').eq('user_id',id).maybeSingle();if(error)throw error;
 if(data?.avatar_kind!=='upload'||!data.avatar_path?.startsWith(id+'/'))return null;
 const result=await client.storage.from('player-avatars').createSignedUrl(data.avatar_path,3600);if(result.error)throw result.error;return result.data.signedUrl;
}
export async function uploadAvatar(client,id,file,identity){
 const image=await prepareAvatar(file),path=`${id}/avatar-${crypto.randomUUID()}.webp`;
 const {error}=await client.storage.from('player-avatars').upload(path,image,{contentType:'image/webp',upsert:false});if(error)throw error;
 const update=await client.from('player_profiles').upsert({user_id:id,display_name:identity.displayName,avatar_kind:'upload',avatar_hero_id:identity.avatar,avatar_path:path,updated_at:new Date().toISOString()});
 if(update.error){await client.storage.from('player-avatars').remove([path]);throw update.error;}
 return getAvatar(client,id);
}
