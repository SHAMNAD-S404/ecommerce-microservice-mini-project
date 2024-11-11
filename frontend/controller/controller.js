


 export const loadLogin = async (req,res) => {

    try {

        return res.render("login")
        
    } catch (error) {
        
    }
 }

 export const loadProducts = async (req,res) => {
    try {

        res.render("home")
        
    } catch (error) {
        console.error(error);
        
    }
 }





 