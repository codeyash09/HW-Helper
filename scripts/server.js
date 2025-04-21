let loggedIn = false;



const db = supabase.createClient(
  'https://mvovikninvudypyuhdqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12b3Zpa25pbnZ1ZHlweXVoZHFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDg1NjAwNSwiZXhwIjoyMDYwNDMyMDA1fQ.GA5vPB-n9gkdpJfrSy2q10fLr9dVHMIEpKGk6ysdpU4'
);

var details;
const errorMessage = document.getElementById("emailErrorMessage");



export async function insertData(user, pass, nombre, bday, mail) {
  const { data, error } = await db.from('Users').insert([
    {
      username: user,
      password: pass,
      name: nombre,
      birthday: bday, // This key now matches the column name
      email: mail
    }
  ]);

  if (error) {
    
    details = error.details;
    errorMessage.textContent = details;
    errorMessage.style.display = "block";
  }else{
    loggedIn = true;
    window.location.replace("/pages/");
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

console.log(loggedIn);


export function logInOfficial(){
  loggedIn = true;
}


export { details };