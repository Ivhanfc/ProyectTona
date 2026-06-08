import Stackk
import random
import os

class uber_clon:

    def __init__(self) -> None:    
        self.uberClon = uber_clon
        self.menu = [] 
        self.orders = {}
        self.History = Stackk.Stackk()
        self.Deliverys = {}

    def setMenuRandom(self, x):
        match x: 
            case 1: self.menu = ["Tacos", "Tostadas", "Flautas", "Gorditas", "Tepache", "Horchata"]
            case 2: self.menu = ["rabbiolis", "Pasta alfredo", "Pasta bolognesa", "Pasta carbonara" ]
            case 3: self.menu = ["hummus", "shawarma", "falafel", "lamb kebab", "chicken kebab"]
            case _ : self.menu = []    
        return self.menu
    
    def showMenu(self):
        print("MENU")
        i = 0
        for x in (self.menu):
            print(i, x)
            i += 1

    def randomDeliverys(self, x):
        genericsNames = ["John", "Mark", "Justin", "Mr beast", "Juliete", "Pedro", "Paul", "Bob"]
        for i in range(x):
            num = random.randint(0, len(genericsNames) -1)
            self.Deliverys[genericsNames[num]] = None
            
        print("Deliverys")
        i = 0
        for x in (self.Deliverys):
            print (i, x)
            i += 1
             
    def addOrder(self):
        name, food_Str = input("Write your name and Select your food: ").split()
        food_int = int(food_Str) 
        choosen_food = self.menu[food_int]
        self.orders[name] = choosen_food
        print(self.orders)
        self.History.push(choosen_food)
        print("Comida ordenada, asignando repartidor...")

            
    def main(self):
        for i in range(100):
            self.Deliverys
        while True:
            print("Welcome to Uber Eat clon")
            num = random.randint(1, 3)
            Menu = self.setMenuRandom(num)
            self.randomDeliverys(10)
            self.showMenu()
            self.addOrder()
        
app = uber_clon()
app.main()