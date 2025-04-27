import { v4 as uuidv4 } from "uuid";
import { Hunt } from "../model/Hunt";
import { hunterDb } from "../HunterDb";
import { getHuntXpathService } from "../singleton/singletons";

export default class HuntService {
  xpathRepository;
  constructor() {
    this.xpathRepository = getHuntXpathService();
  }

  async huntTotalCont() {
    return await hunterDb.hunt.count();
  }

  async huntPaginate(offset, limit) {
    return await hunterDb.hunt
      .orderBy("updated")
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
  }

  async findByUrl(url: string) {
    return await hunterDb.hunt.filter((hunt) => hunt.url == url).first();
  }

  async huntSearch(term, limit) {
    const regex = new RegExp(term, "i");
    return await hunterDb.hunt
      .orderBy("updated")
      .reverse()
      .filter((hunt) => regex.test(hunt.url) || regex.test(hunt.html))
      .limit(limit)
      .toArray();
  }

  async huntCreate(hunt: Hunt) {
    const obj: Hunt = {
      id: uuidv4(),
      url: hunt.url,
      html: hunt.html,
      updated: new Date(),
    };
    await hunterDb.hunt.add(obj);
    return obj;
  }

  async huntBulkAdd(hunters: []) {
    try {
      let huntMapped = hunters.map((h: any) => {
        return {
          id: uuidv4(),
          url: h.url,
          html: h.html,
          updated: new Date(),
        };
      });
      await hunterDb.hunt.bulkAdd(huntMapped);
    } catch (error) {
      return false;
    }
  }

  async huntDelete(id: string) {
    try {
      await hunterDb.hunt.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async huntClearTable() {
    try {
      await hunterDb.hunt.clear();
      return true;
    } catch (error) {
      return false;
    }
  }

  async huntAutoHuntBulkAdd(bulk = []) {
    try {
      let bulkGroup = this.groupByUrl(bulk);

      for (const [url, itens] of Object.entries(bulkGroup)) {
        let hunt = await this.huntFindOrCreate(url, "");

        let itensMapped = itens.map((h: any) => {
          if (hunt) {
            h.idHunt = hunt.id;
          }
          return h;
        });

        await this.xpathRepository.huntXPathBulkAdd(itensMapped);
      }
    } catch (error) {
      console.error("Erro no huntAutoHuntBulkAdd:", error);
      return false;
    }
  }

  groupByUrl(arr: any[]): Record<string, any[]> {
    return arr.reduce((acc, item) => {
      if (!acc[item.url]) {
        acc[item.url] = [];
      }
      acc[item.url].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }

  async huntFindOrCreate(url, html) {
    try {
      let hunt = await this.findByUrl(url);
      if (!hunt) {
        hunt = await this.huntCreate({
          id: "",
          url: url,
          html: html,
          updated: new Date(),
        });
      }
      return hunt;
    } catch (error) {
      return false;
    }
  }
}
