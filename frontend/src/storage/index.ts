import React from "react";
import { cipher, decipher } from "../crypto";

const isClient = typeof window !== "undefined";
export type StorageType = "CliInfo";
interface StorageInterface<T> {
  parser: () => T;
  save: (e: T) => void;
  set: (value: T) => void;
  get: () => T;
}
/**
 * object => JSON.stringify()=>암호화=>저장
 * 불러오기=> 복호화 => JSON.parse()=>object
 */

class Storage<T> implements StorageInterface<T> {
  obj: T;
  name: string;
  constructor(name: string, defaultOptions: T) {
    this.obj = defaultOptions;
    this.name = name;
  }
  parser() {
    const value = localStorage.getItem(this.name);
    if (value) {
      const crypted = decipher(value);
      const decrypted: T = JSON.parse(crypted);
      console.log("decrypted", decrypted);
      for (let key in this.obj) {
        if (decrypted[key] == null || decrypted[key] == undefined) {
          decrypted[key] = this.obj[key];
        }
      }
      return decrypted;
    } else {
      return this.obj;
    }
  }
  save(value: T) {
    const stringify = JSON.stringify(value);
    cipher(stringify).then((res) => localStorage.setItem(this.name, res));
  }
  get() {
    return this.parser();
  }
  set(value: T) {
    this.save(value);
  }
}

export interface CreateStoreReturnValue<T> {
  getValue: () => T;
  setValue: (nextValue: T) => void;
  onChange: (callback: (newValue: T) => void) => void;
}
interface StoreProps<T> {
  key: string;
  defaultValue: T;
}
export function createStore<T>({
  key,
  defaultValue,
}: StoreProps<T>): CreateStoreReturnValue<T> {
  const storage = new Storage(key, defaultValue);
  let value: T;
  console.log(isClient);
  let persistValue = isClient ? storage.get() : false;
  console.log(persistValue);
  if (!persistValue) {
    value = defaultValue;
  } else {
    isClient && storage.set(persistValue);
    value = persistValue;
  }
  const callbackList: Array<(newValue: T) => void> = [];
  const getValue = () => value;
  const setValue = (newValue: T) => {
    value = newValue;
    storage.set(newValue);
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
}
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
  directory: "/",
  cmd: "",
};
export const configAtom = createStore({
  key: "CliInfo",
  defaultValue: defaultConfig,
});
export const useConfig = <K extends keyof ConfigType>() => {
  const [getter, setter] = useGlobalStore<ConfigType>(configAtom);

  function set(e: K, value: ConfigType[K]) {
    setter({ ...getter, [e]: value });
  }

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
    set,
    setPath,
    setHostname,
    setUser,
    setPort,
    setPassword,
    setCmd,
  };
};
