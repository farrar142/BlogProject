import React from "react";
import { cipher, decipher } from "../crypto";

const isClient = typeof window !== "undefined";
type StorageType = {
  [key: string]: string;
};
export class Storage {
  name: string;
  obj: StorageType;
  str: string;
  constructor(name: string) {
    this.name = name;
    this.obj = {};
    this.str = "";
    this.initializer();
  }
  initializer() {
    if (isClient) {
      const value = JSON.parse(
        decipher(localStorage.getItem(this.name) || "false")
      );
      if (!value) {
        cipher(JSON.stringify({})).then((value) => {
          localStorage.setItem(this.name, value);
        });
        this.obj = {};
      } else {
        this.obj = value;
      }
    } else {
      this.obj = {};
    }
  }
  set(key: string, value: any) {
    // this.initializer();
    this.obj = { ...this.obj, [key]: value };
    this.save();
  }
  get(key: string) {
    // this.initializer();
    return this.obj[key];
  }
  del(key: string) {
    // this.initializer();
    let tmp = {};
    for (let i in this.obj) {
      if (i !== key) {
        tmp = { ...tmp, [i]: this.obj[i] };
      } else {
        tmp = { ...tmp, [i]: null };
      }
    }
    this.obj = tmp;
    this.save();
  }
  save() {
    cipher(JSON.stringify(this.obj)).then((value) => {
      localStorage.setItem(this.name, value);
    });
  }
}
export interface CreateStoreReturnValue<T> {
  getValue: () => T;
  setValue: (nextValue: T) => void;
  onChange: (callback: (newValue: T) => void) => void;
}
interface StoreProps {
  key: string;
  defaultValue: any;
}
export const createStore = <T = any>({
  key,
  defaultValue,
}: StoreProps): CreateStoreReturnValue<T> => {
  const storage = new Storage("myState");
  let value: any;
  let persistValue = isClient ? storage.get(key) : false;
  if (!persistValue) {
    value = defaultValue;
  } else {
    isClient && storage.set(key, persistValue);
    value = persistValue;
  }
  const callbackList: Array<(newValue: T) => void> = [];
  const getValue = () => value;
  const setValue = (newValue: T) => {
    value = newValue;
    storage.set(key, newValue);
    callbackList.forEach((callback) => callback(newValue));
  };
  const onChange = (callback: (newValue: any) => void) => {
    callbackList.push(callback);
    return () => {
      const idx = callbackList.findIndex(callback);
      callbackList.splice(idx, 1);
    };
  };

  return { getValue, setValue, onChange };
};
type GlobalStoreReturnValue<T> = [T, (e: T) => void];

export const useGlobalStore = <T = any>(
  store: CreateStoreReturnValue<T>
): GlobalStoreReturnValue<T> => {
  const [value, setValue] = React.useState<T>(store.getValue());
  React.useEffect(() => {
    const clean = store.onChange((nextValue) => {
      setValue(nextValue);
    });
    return clean;
  }, [store]);
  return [value, store.setValue];
};
export const myFirstAtom = createStore({
  key: "shutthuefuckup",
  defaultValue: "",
});
export const useShut = (): [string, (e: string) => void] => {
  const [getter, setter] = useGlobalStore<string>(myFirstAtom);
  const handler = (e: string) => {
    setter(e);
  };
  return [getter, handler];
};
type ConfigType = {
  path: string;
  hostname: string;
  user: string;
  port: string;
  password: string;
  directory: string;
  cmd: string;
};
const defaultConfig = {
  path: "/",
  hostname: "server",
  user: "root",
  port: "22",
  password: "",
  cmd: "",
};
export const configAtom = createStore({
  key: "configAtom",
  defaultValue: defaultConfig,
});
export const useConfig = () => {
  const [getter, setter] = useGlobalStore<ConfigType>(configAtom);
  function setPath(e: string) {
    setter({ ...getter, path: e });
  }
  function setHostname(e: string) {
    setter({ ...getter, hostname: e });
  }
  function setUser(e: string) {
    setter({ ...getter, user: e });
  }
  function setPort(e: string) {
    setter({ ...getter, port: e });
  }
  function setPassword(e: string) {
    setter({ ...getter, password: e });
  }
  function setCmd(e: string) {
    setter({ ...getter, cmd: e });
  }
  return {
    getter,
    setPath,
    setHostname,
    setUser,
    setPort,
    setPassword,
    setCmd,
  };
};
