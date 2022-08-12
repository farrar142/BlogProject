from django.core.cache import cache


class useCache:
    def __init__(self, model: str):
        self.model = model
        self.data = cache.get_or_set(self.model, {})

    def refresh(self):
        self.data = cache.get_or_set(self.model, {})

    def save(self):
        cache.set(self.model, self.data)

    def set(self, id, data):
        self.refresh()
        self.data[id] = data
        self.save()
        return data

    def get(self, id):
        self.refresh()
        data = self.data.get(id)
        if data:
            return data
        else:
            return False

    def get_or_set(self, id, data):
        data = self.get(id)
        if data:
            return data
        else:
            return self.set(id, data)

    def get_data(self):
        return self.data

    def delete(self):
        cache.delete(self.model)
        return cache.get(self.model)
