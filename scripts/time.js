export function convertToLocalTime(centralTime) {
    // Parse the ISO timestamp
    let date = new Date(centralTime);

    let rn = new Date();

    let daysApart = (rn - date)*0.001*(1/60)*(1/60)*(1/24);

    let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayOfWeek = weekdays[date.getDay()];

    if(daysApart > 6){
        let options = { 
             
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
    
        };

        return date.toLocaleString(undefined, options);
    }

    if(daysApart <= 6){

        if((rn.getDay() == date.getDay() + 1) || (rn.getDay() == 0 && date.getDay() == 6)){
            let options = { 
                
                
                hour: '2-digit', 
                minute: '2-digit', 
           
            };

            return "Yesterday at " + date.toLocaleString(undefined, options);
        }

        else if(rn.getDay() == date.getDay()){
            let options = { 
                
                
                hour: '2-digit', 
                minute: '2-digit', 
           
            };

            return "Today at " + date.toLocaleString(undefined, options);
        }
        else{
            let options = { 
                
                weekday: "long",
                hour: '2-digit', 
                minute: '2-digit', 
           
            };

            return date.toLocaleString(undefined, options);
        }
    }

    

    // Get the local time and formatted date
    
}
