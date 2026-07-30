
class Queue:
    def __init__(self) -> None:
        self.Queue = []
        self.Top = -1
        
    def enqueue(self, value):
        self.Stack.append(value)
    
    def pop(self):
        self.Stack.remove (len(self.Stack) - 1)

    def peek(self):
        print(len(self.Stack[self.Top]))

    def isEmpty(self):
        if(len(self.Stack) < 0):
            print("This fucking array is a CEROU")
            return True
        else: 
            print("This ArrayStack is FULL BRODA")
            return False
        

    def showStack(self):
        print(self.Stack)

