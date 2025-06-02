let loggedIn = false;
let userId;

if(!localStorage.getItem('loggedInStatus')){
  window.localStorage.setItem('loggedInStatus', false);
  window.localStorage.setItem('userIdentify', null);
  
} else{
  loggedIn = window.localStorage.getItem('loggedInStatus');
  userId = window.localStorage.getItem('userIdentify');
  
}

let db = supabase.createClient(
    'https://afqxanpmrvmdsthdqfap.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXhhbnBtcnZtZHN0aGRxZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcyNDE4NiwiZXhwIjoyMDY0MzAwMTg2fQ.rucKLZxCP1u7Rhkq2Nb0OUjP9JbMeGtdQ-E67Z2pDYQ'
);

var details;
const errorMessage = document.getElementById("emailErrorMessage");

export async function fetchId(tableName, column, value) {
  const { data, error } = await db
    .from(tableName)
    .select('id')
    .eq(column, value);

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}

export async function insertData(user, pass, nombre, bday, mail) {
  const { data, error } = await db.from('Users').insert([
    {
      username: user,
      password: pass,
      name: nombre,
      birthday: bday,
      email: mail
    }
  ]);

  if (error) {
    
    details = error.details;
    errorMessage.textContent = details;
    errorMessage.style.display = "block";
  }else{
    window.localStorage.setItem('loggedInStatus', true);


    let id = fetchId('Users', 'username', user);

    if(id != undefined){
      id.then(result =>{
        if(result[0] != undefined){
          id = result[0].id;

          window.localStorage.setItem('userIdentify', id);

    
          window.location.replace("/pages/");
        }
      });
    }


    
  }
  
}

export async function fetchPassword(tableName, column, value) {
  const { data, error } = await db
    .from(tableName)
    .select('password')
    .eq(column, value);

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}



export { details };