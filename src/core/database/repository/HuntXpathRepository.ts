import { v4 as uuidv4 } from "uuid";
import { HuntXpath } from "../model/HuntXpath";
import { hunterDb } from "../HunterDb";

export default class HuntXpathService {
  constructor() {}

  async xpathTotalCount() {
    return await hunterDb.huntXpath.count();
  }

  async xpathTotalCountByHunt(id) {
    return await hunterDb.huntXpath.where("idHunt").equals(id).count();
  }

  async xpathPaginate(offset, limit) {
    return await hunterDb.huntXpath
      .orderBy("updated")
      .reverse()
      .limit(limit)
      .offset(offset)
      .toArray();
  }

  async xpathPaginateByHunt(id, offset, limit) {
    return await hunterDb.huntXpath
      .where("idHunt")
      .equals(id)
      .reverse()
      .offset(offset)
      .limit(limit)
      .sortBy("updated");
  }

  async findByXpath(term: string, idHunt: string) {
    return await hunterDb.huntXpath
      .filter((hx) => hx.xpath == term && hx.idHunt == idHunt)
      .first();
  }

  async xpathSearch(term, limit) {
    const regex = new RegExp(term, "i");
    return await hunterDb.huntXpath
      .orderBy("updated")
      .reverse()
      .filter((hunt) => regex.test(hunt.xpath) || regex.test(hunt.content))
      .limit(limit)
      .toArray();
  }

  async xpathCreate(hunt: HuntXpath) {
    const obj: HuntXpath = {
      id: uuidv4(),
      idHunt: hunt.idHunt,
      xpath: hunt.xpath,
      content: hunt.content,
      attributes: hunt.attributes,
      updated: new Date(),
    };
    await hunterDb.huntXpath.add(obj);
    return obj;
  }

  async xpathDelete(id: string) {
    try {
      await hunterDb.huntXpath.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async xpathClearTable() {
    try {
      await hunterDb.huntXpath.clear();
      return true;
    } catch (error) {
      return false;
    }
  }

  async xpathDeleteByHunt(id: string) {
    try {
      await hunterDb.huntXpath.filter((hx) => hx.idHunt == id).delete();
      return true;
    } catch (error) {
      return false;
    }
  }

  async huntXPathBulkAdd(hunters: []) {
    try {
      let huntMapped = hunters.map((h: any) => {
        return {
          id: uuidv4(),
          idHunt: h.idHunt,
          xpath: h.xpath,
          content: h.content,
          attributes: h.attributes,
          updated: new Date(),
        };
      });
      await hunterDb.huntXpath.bulkAdd(huntMapped);
    } catch (error) {
      return false;
    }
  }
}
