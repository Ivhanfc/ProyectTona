
class Stackk:
    def __init__(self) -> None:
        self.Stack = []
        self.Top = -1
        
    def push(self, value):
        self.Stack.append(value)
        self.Top += 1 
    
    def pop(self):
        if self.isEmpty():
            print("Stack is empty, nothing to pop")
            return None
        topValue = self.Stack[self.Top]
        del self.Stack[self.Top]
        self.Top -= 1
        return topValue

    def peek(self):
        if self.isEmpty():
            print("Stack is empty, nothing to pop")
            return None
        
        return self.Stack[-1]

    def isEmpty(self):
        if(len(self.Stack) == 0):
            print("This  array is a CEROU")
            return True
        else: 
            return False
        

    def showStack(self):
        print(self.Stack)

