from typing import List, Optional

from app.models.order_model import OrderModel

class Queuee:
    def __init__(self) -> None:
        self.items: List[OrderModel] = []

        
    def enqueue(self, value: OrderModel):
        self.items.append(value)
    
    def dequeue(self) -> Optional[OrderModel]:
        if not self.isEmpty():
            return self.items.pop(0)
        return None

    def isEmpty(self):
        if(len(self.items) == 0):
            return True
        else: 
            return False
        

    def showQueue(self):
        print(self.items)

