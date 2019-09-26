export class Human {
    private Name : String; 
    private Age : Number; 

    constructor (name : String , age : Number) {
        this.Name = name; 
        this.Age = age;
    }

    print () {
        console.log('Name : ' + this.Name + ' Age : ' + this.Age);
    }
}