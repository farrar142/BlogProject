import { useTheme } from "@mui/material";
import { useRef, useEffect, useState, LegacyRef } from "react";
import { useDarkMode } from "../../../src/atoms";
import { Coord, useMousePosition } from "../../../src/functions";

// customFunction End
type AsideNavBarProps = {
  highlighter?: string;
  sx?: any;
  router: string;
  htmlEl: React.MutableRefObject<null>;
  editortrue: boolean;
};
type CustomEl = {
  depth: number;
  child: Array<CustomEl>;
  context: string;
  id: string;
  item: HTMLElement | null;
  offset: number;
  offsetHeight: number;
};
interface CustomEls extends Array<CustomEl> {
  [index: number]: CustomEl;
}
type NodeList = {
  [index: number]: Array<CustomEl>;
};
type Node = {
  [index: number]: CustomEl;
};
type OffsetNode = {
  [index: number]: number;
};
//mainComponent Start
const AsideNavBar = (props: AsideNavBarProps) => {
  const theme = useTheme();
  const highlightedText = theme.palette.secondary.main;
  const style = props.sx ? props.sx : {};
  const htmlEl = props.htmlEl;
  const editortrue = props.editortrue;
  const [titleNav, setTitleNav] = useState<Element | null>(null);
  const scrollPosition = useScrollPosition();
  const mousePosition = useMousePosition(".ViewerContainer");
  const [isDark, setDark] = useDarkMode();
  const TEXT_COLOR = isDark ? "block" : "white";
  const router = props.router;
  let targetPath: boolean | string = false;
  if (router.split("#").length > 0) {
    targetPath = decodeURI(router.split("#")[0]);
  }
  const toast = htmlEl.current as any;
  useInterval(
    () => {
      if (!titleNav) {
        setTitleNav(window.document.querySelector(".toastui-editor-contents"));
      }
    },
    titleNav ? null : 1000
  );
  if (!titleNav) {
    return <div>로딩중</div>;
  }
  const tags = ["h1", "h2", "h3", "h4", "h5"];
  let all_list: Array<CustomEl> = [];
  let depth = 0;
  let s1 = tags.map((tag) => {
    depth++;
    return (all_list = all_list.concat(
      htmlCollectionToArray(titleNav.getElementsByTagName(tag), depth)
    ));
  });
  all_list = sortById(all_list, "id");
  all_list = offsetSetter(all_list);
  function emptyEl() {
    return {
      id: "0",
      depth: 0,
      child: [],
      context: "",
      item: null,
      offset: 0,
      offsetHeight: 0,
    };
  }
  let dummy: CustomEl = {
    id: "0",
    depth: 0,
    child: [],
    context: "",
    item: null,
    offset: 0,
    offsetHeight: 0,
  };
  let last_item = dummy;
  let latest_item = dummy;
  let node_list: NodeList = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };
  let node: Node = {
    //깊은 참조용
    0: emptyEl(),
    1: emptyEl(),
    2: emptyEl(),
    3: emptyEl(),
    4: emptyEl(),
    5: emptyEl(),
  };
  node[0] = dummy;
  node[1] = dummy;
  let offset_node: OffsetNode = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let last_depth = 0;
  let t1 = all_list[0];
  try {
    for (let item in all_list) {
      t1 = all_list[item];
      if (latest_item.depth < t1.depth) {
        //더 깊이 들어감
        node[t1.depth] = latest_item; //현재깊이의 바로 상위노드 저장
        node_list[t1.depth] = []; //사용할 노드리스트 초기화
        node_list[t1.depth].push(t1);
        // offset_node[t1.depth] = 0;
        offset_node[t1.depth] = latest_item.offsetHeight + t1.offsetHeight;
        for (let i = 1; i <= t1.depth; i++) {
          offset_node[t1.depth - i] += t1.offsetHeight;
        }
      } else if (latest_item.depth == t1.depth) {
        //같은 위치에서 배열에 푸시
        node_list[t1.depth].push(t1);
        offset_node[t1.depth] += t1.offsetHeight;

        for (let i = 1; i <= t1.depth; i++) {
          offset_node[t1.depth - i] += t1.offsetHeight;
        }
      } else {
        node_list[t1.depth].push(t1); //밖으로나옴 이전노드들과 달리 상위노드에 저장됨.
        offset_node[t1.depth] += t1.offsetHeight;
        for (let i = 0; i <= latest_item.depth - t1.depth; i++) {
          let idx = latest_item.depth - i;

          node[idx].child = node_list[idx]; //depth 4에서 1로가는경우 4~1 노드리스트를 저장함
          node[idx].offsetHeight = offset_node[idx];
          offset_node[idx + 1] = 0;
        }
      }
      latest_item = t1;
    }
    //마지막노드에서 0번노드까지 정리.
    for (let i = 0; i <= t1.depth; i++) {
      offset_node[t1.depth - i] += t1.offsetHeight;
    }
    for (let i = 0; i <= latest_item.depth; i++) {
      let idx = latest_item.depth - i;
      node[idx].child = node_list[idx]; //depth 4에서 1로가는경우 4~1 노드리스트를 저장함
      node[idx].offsetHeight = offset_node[idx];
    }
    node[last_item.depth].child = node_list[last_depth];
    dummy.child = node_list[1];
    dummy.offsetHeight = offset_node[0];
    all_list.map((item) => anchorMapper(item)); //구조분해하게되면 섈로카피를 해서 따로 해줌.
    return (
      <div style={style}>
        <SubComponent
          highlightedText={highlightedText}
          key={"main"}
          myItem={[dummy, ...all_list][0]}
          sposition={scrollPosition}
          editortrue={editortrue}
          TEXT_COLOR={TEXT_COLOR}
          mousePosition={mousePosition}
        ></SubComponent>
      </div>
    );
  } catch {
    return <div style={style}></div>;
  }
};
type SubComponenetProps = {
  highlightedText: string;
  key: string;
  myItem: CustomEl;
  editortrue: boolean;
  sposition: number;
  TEXT_COLOR: string;
  mousePosition: Coord;
};
const SubComponent = (props: SubComponenetProps) => {
  const mousePosition = props.mousePosition;
  const highlightedText = props.highlightedText;
  const myItem = props.myItem;
  const scrollPosition = props.sposition;
  const editortrue = props.editortrue;
  const TEXT_COLOR = props.TEXT_COLOR;
  if (myItem) {
    const isDisplay = (value: string | null = null) => {
      let _target = document.getElementsByClassName(
        `asideNavBar-${myItem.id}`
      )[0] as HTMLElement;
      let target = _target.style.display;
      if (target === "block") {
        _target.style.display = value || "none";
      } else {
        _target.style.display = value || "block";
      }
    };
    const isFirst = (id: number) => {
      if (id !== 0) {
        return editortrue ? "block" : "none";
      } else {
        return "block";
      }
    };
    const highlighter = (): [string, string] => {
      if (
        myItem.offset - 140 < scrollPosition + mousePosition.y - 140 &&
        scrollPosition + mousePosition.y - 140 <
          myItem.offset + myItem.offsetHeight - 140
      ) {
        try {
          isDisplay("block");
        } catch {}
        return [
          editortrue ? "1rem" : "1.4rem",
          editortrue ? TEXT_COLOR : highlightedText,
        ];
      } else {
        try {
          editortrue ? isDisplay("block") : isDisplay("none");
        } catch {}
        return [editortrue ? "1rem" : "0.7rem", TEXT_COLOR];
      }
    };
    return (
      <div key={myItem.id}>
        <div>
          <a
            onClick={() => isDisplay()}
            href={`#${myItem.context}`}
            // onClick={() => scrollToItem(item.item)}
            style={{
              marginLeft: `${myItem.depth * 20}px`,
              textDecoration: "none",
              whiteSpace: "nowrap",
              fontSize: highlighter()[0],
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              display: "block",
            }}
          >
            <div style={{ color: highlighter()[1] }}>{myItem.context}</div>
          </a>
          {/* {isButton()} */}
          <div
            style={{ display: isFirst(parseInt(myItem.id)) }}
            className={`asideNavBar-${myItem.id}`}
          >
            {myItem.child.map((item) => {
              return (
                <SubComponent
                  mousePosition={mousePosition}
                  TEXT_COLOR={"white"}
                  highlightedText={highlightedText}
                  key={item.context}
                  myItem={item}
                  sposition={scrollPosition}
                  editortrue={editortrue}
                ></SubComponent>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  return <div></div>;
};
// customHook End
export default AsideNavBar;
export function useInterval(callback: any, delay: any) {
  const savedCallback = useRef<any>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function anchorMapper(item: CustomEl) {
  if (item.item) {
    item.item.id = item.context;
    item.item.className = item.context;
    item.item.setAttribute("style", `scroll-margin-top:70px;`);
  }
}

function htmlCollectionToArray(target: HTMLCollection, depth: number) {
  let s1: Array<HTMLElement> = Array.prototype.slice.call(target);
  let s2: Array<CustomEl> = s1.map((item) => {
    return {
      context: item.innerText,
      child: [],
      item,
      depth: depth,
      id: item.dataset.nodeid as string,
      offset: item.offsetTop,
      offsetHeight: 0,
    };
  });
  return s2;
}
export function useScrollPosition(value = null) {
  const [scrollPosition, setPosition] = useState(0);
  const listenToScroll = () => {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const scrolled = winScroll / height;
    setPosition(winScroll);
    return {
      theposition: scrolled,
    };
  };
  useEffect(() => {
    window.addEventListener("scroll", listenToScroll);
    return () => {
      window.removeEventListener("scroll", listenToScroll);
    };
  }, []);
  return scrollPosition;
}
function offsetSetter(target: Array<CustomEl>) {
  let s1 = target;
  let container = [];
  if (target) {
    for (let i = 0; i < target.length; i++) {
      const t1 = s1[i];
      let t2 = null;
      let offsetHeight = 0;
      try {
        t2 = s1[i + 1];
        offsetHeight = t2.offset - t1.offset;
      } catch {
        offsetHeight = 10000;
      }
      container.push({
        ...t1,
        offsetHeight: offsetHeight,
      });
    }
    return container;
  } else {
    return [];
  }
}
export function sortById(arr: Array<any>, target = "id") {
  const result = arr.sort((item1, item2) => {
    if (parseInt(item1[target]) < parseInt(item2[target])) {
      return -1;
    } else if (parseInt(item1[target]) > parseInt(item2[target])) {
      return 1;
    } else {
      return 0;
    }
  });
  return result;
}
