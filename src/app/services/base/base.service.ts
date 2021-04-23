import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServeurResponse } from 'src/app/class/serveur-response/serveur-response';
import { map } from 'rxjs/operators';
import { Base } from 'src/app/class/base/base';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T extends Base> {
  protected baseUrl: string;
  protected objectList: T[];
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public objectListObs: Subject<T[]> = new Subject<T[]>();

  constructor(protected http: HttpClient) { }

  public fetch(): void {
    this.http.get<ServeurResponse>(this.baseUrl).subscribe(
      value =>{
        this.objectList = [];
        if(value.status==='success'){
          for(const info of value.result){
            this.objectList.push(this.jsonToObjectConvert(info));
          }
        }
        this.update();
      }
    );
  }

  public getCondition(condition: string,param='*', opts='*'): Observable<T[] | Error>{
    return this.http.post<ServeurResponse>(this.baseUrl+`/condition`,
    {
      condition,
      param,
      option : opts
    }).pipe(
      map(value =>{
        if(value.status==='success'){
          const result: T[] = [];
          for(const info of value.result){
            result.push(this.jsonToObjectConvert(info));
          }
          return result;
        }else {
          return new Error(value.result);
        }
      })
    );
  }

  public getById(id: number): Observable<T | Error>{
    return this.http.get<ServeurResponse>(this.baseUrl+`/id/${id}`).pipe(
      map(value =>{
        if(value.status==='success'){
          return this.jsonToObjectConvert(value.result);
        } else {
          return new Error(value.result);
        }
      })
    );
  }

  public getByKey(key: any): Observable<T | Error>{
    return this.http.get<ServeurResponse>(this.baseUrl+`/key/${key}`).pipe(
      map(value =>{
        if(value.status==='success'){
          return this.jsonToObjectConvert(value.result);
        } else {
          return new Error(value.result);
        }
      })
    );
  }

  public createNew(newObject: T): Observable< T | Error>{
    return this.http.post<ServeurResponse>(this.baseUrl,this.objectToJsonConvert(newObject))
    .pipe(
      map(value =>{
        if(value.status==='success'){
          newObject.setId(value.result);
          return newObject;
        } else {
          return new Error(value.result);
        }
      })
    );
  }

  public edit(updatedObject: T): Observable<T | Error>{
    return this.http.put<ServeurResponse>(this.baseUrl+`/${updatedObject.getId()}`,this.objectToJsonConvert(updatedObject))
    .pipe(
      map(value =>{
        if(value.status==='success'){
          return updatedObject;
        } else {
          return new Error(value.result);
        }
      })
    );
  }

  public delete(id: number): Observable<boolean | Error>{
    return this.http.delete<ServeurResponse>(this.baseUrl+`/${id}`).pipe(
      map(value =>{
        if(value.status==='success'){
          return true;
        } else {
          return new Error(value.result);
        }
      })
    );
  }

  public searchOn(id: number): T{
    let i = 0;
    while(i<this.objectList.length && id!==this.objectList[i].getId()){
      i++;
    }
    if(i<this.objectList.length){
      return this.objectList[i];
    } else {
      return null;
    }
  }

  public getDateStr(date: Date){
    let d = `${date.getFullYear()}-`;
    if(date.getMonth()+1<10){
      d+=`0${date.getMonth()+1}`;
    }else{
      d+=`${date.getMonth()+1}`;
    }
    d+='-';
    if(date.getDate()<10){
      d+=`0${date.getDate()}`;
    }else{
      d+=`${date.getDate()}`;
    }
    let time = '';
    if(date.getHours()<10){
      time+=`0${date.getHours()}`;
    }else{
      time+=`${date.getHours()}`;
    }
    time+=':';
    if(date.getMinutes()<10){
      time+=`0${date.getMinutes()}`;
    }else{
      time+=`${date.getMinutes()}`;
    }
    return d+'T'+time;
  }

  protected update(){
    this.objectListObs.next(this.objectList);
  }

  public abstract jsonToObjectConvert(info: any): T;
  public abstract objectToJsonConvert(obj: T): any;
}