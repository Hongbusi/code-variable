import { useEffect, useState } from "react";
import fetch from "node-fetch";
import { sample } from "lodash-es";
import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { format }  from './utils'
interface TranslateWebResult {
  value: Array<string>;
  key: string;
}

interface TranslateResult {
  translation?: Array<string>;
  basic?: { phonetic?: string; explains?: Array<string> };
  web?: Array<TranslateWebResult>;
  errorCode: string;
}

// 此 key 全采集于 github 上面，若有冒犯就先谢罪了啊哈...
const FIXED_KEY = [
  { keyfrom: "CoderVar", key: "802458398" },
  { keyfrom: "whatMean", key: "1933652137" },
  { keyfrom: "chinacache", key: "1247577973" },
  { keyfrom: "huipblog", key: "439918742" },
  { keyfrom: "chinacache", key: "1247577973" },
  { keyfrom: "fanyi-node", key: "593554388" },
  { keyfrom: "wbinglee", key: "1127870837" },
  { keyfrom: "forum3", key: "1268771022" },
  { keyfrom: "node-translator", key: "2058911035" },
  { keyfrom: "kaiyao-robot", key: "2016811247" },
  { keyfrom: "stone2083", key: "1576383390" },
  { keyfrom: "myWebsite", key: "423366321" },
  { keyfrom: "leecade", key: "54015339" },
  { keyfrom: "github-wdict", key: "619541059" },
  { keyfrom: "lanyuejin", key: "2033774719" },
];

const PREFIX = ["xt ", "dt ", "xh ", "cl ", "zh "]

function getTranslateUrl(params: { keyfrom: string; key: string; type: string; doctype: string; version: string; q: string }) {
  return `http://fanyi.youdao.com/openapi.do?${new URLSearchParams(params).toString()}`;
}

function startsWith(content: string) {
  return PREFIX.includes(content.substring(0, 3))
}

function handleContent(content: string) {
  if(startsWith(content)) {
    return content.substring(3)
  }
  return ''
}

function translateAPI(content: string) {
  const q = handleContent(content)
  const selected = sample(FIXED_KEY);

  const url = getTranslateUrl({
    keyfrom: selected.keyfrom,
    key: selected.key,
    type: 'data',
    doctype: 'json',
    version: '1.1',
    q,
  });

  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

function formatTranslateResult(translateResult: TranslateResult, prefix: string) {
  const result = { translation: [] };
  const reg = /^[a-zA-Z ]/;
  const { translation, basic, web } = translateResult;

  translation?.forEach(item => {
    if (reg.test(item)) {
      result.translation.push(format(item, prefix));
    }
  })

  return result
}

function TranslateResultActionPanel(props: { copyContent: string }) {
  const { copyContent } = props;
  return (
    <ActionPanel>
      <Action.CopyToClipboard content={copyContent} />
    </ActionPanel>
  );
}

const defaultTranslateResult: TranslateResult = {
  basic: {},
  translation: undefined,
  web: undefined,
  errorCode: "",
};

export default function Command() {
  const [isLoading, setLoadingStatus] = useState(false);
  const [toTranslate, setToTranslate] = useState("");
  const [{ basic, translation, web }, setTranslateResult] = useState(defaultTranslateResult);

  useEffect(() => {
    if (!startsWith(toTranslate)) return;

    setLoadingStatus(true);

    (async () => {
      const response = await translateAPI(toTranslate);
      setTranslateResult(formatTranslateResult(((await response.json()) as TranslateResult) || {}, toTranslate.substring(0, 2)));
      setLoadingStatus(false);
    })();
  }, [toTranslate]);

  return (
    <List
      searchBarPlaceholder="Enter text to translate"
      onSearchTextChange={setToTranslate}
      isLoading={isLoading}
      throttle
    >
      {translation?.map((item, index) => (
        <List.Item
          key={index}
          title={item}
          icon={{ source: Icon.Dot, tintColor: Color.Red }}
          actions={<TranslateResultActionPanel copyContent={item} />}
        />
      ))}
    </List>
  );
}
