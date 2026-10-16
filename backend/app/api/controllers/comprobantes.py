import io
import pandas as pd
from fastapi import Response
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas.comprobante import ComprobanteCreate, ComprobantePaginatedResponse, ComprobanteUpdate, ComprobanteResponse
from app.crud import crud_comprobante
from app.models.Usuario import Usuario

router = APIRouter(prefix="/comprobantes", tags=["Comprobantes"])

@router.get("/ultimo-numero")
def obtener_ultimo_numero(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    numero = crud_comprobante.get_ultimo_numero_envio(db)
    return {"ultimo_numero": numero}

@router.post("/", response_model=ComprobanteResponse, status_code=status.HTTP_201_CREATED)
def create_comprobante(comprobante_in: ComprobanteCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    comprobante_existente = crud_comprobante.get_comprobante_by_numero(db, numero_comprobante=comprobante_in.numero_comprobante)
    if comprobante_existente:
        raise HTTPException(status_code=400, detail="El número de comprobante ya se encuentra registrado.")
    
    return crud_comprobante.create_comprobante(db=db, comprobante=comprobante_in, usuario_id=current_user.id)

@router.get("/", response_model=ComprobantePaginatedResponse)
def get_comprobantes(skip: int = 0, limit: int = 10, search: Optional[str] = None, localidad_id: Optional[int] = None, cliente_id: Optional[int] = None, tipo: Optional[str] = None, fecha_desde: Optional[date] = None, fecha_hasta: Optional[date] = None, estado: Optional[str] = None, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return crud_comprobante.get_comprobantes(db=db, skip=skip, limit=limit, search=search, localidad_id=localidad_id, cliente_id=cliente_id, tipo=tipo, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta, estado=estado)

@router.get("/exportar/general")
def exportar_excel_general(skip: int = 0, limit: int = 10000, search: Optional[str] = None, localidad_id: Optional[int] = None, cliente_id: Optional[int] = None, tipo: Optional[str] = None, fecha_desde: Optional[date] = None, fecha_hasta: Optional[date] = None, estado: Optional[str] = None, db: Session = Depends(get_db)):
    
    resultado = crud_comprobante.get_comprobantes(db=db, skip=skip, limit=limit, search=search, localidad_id=localidad_id, cliente_id=cliente_id, tipo=tipo, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta, estado=estado)
    comprobantes = resultado["items"]
    
    if not comprobantes:
        raise HTTPException(status_code=404, detail="No hay comprobantes para exportar con los filtros seleccionados.")

    datos = []
    for c in comprobantes:
        datos.append({
            "Fecha": c.fecha_emision.strftime("%d/%m/%Y"),
            "Localidad Origen": c.localidad_remitente_rel.nombre if c.localidad_remitente_rel else "-",
            "Localidad Destino": c.localidad_destinatario_rel.nombre if c.localidad_destinatario_rel else "-",
            "N° Comprobante": c.numero_comprobante,
            "Remitente": c.nombre_remitente or (c.cliente.razon_social if c.cliente else "-"),
            "Destinatario": c.nombre_destinatario,
            "Bultos": c.cantidad_bultos,
            "C/R": float(c.importe_contra_reembolso or 0),
            "Flete Pago": float(c.importe_flete_pago or 0),
            "Flete a Cobrar": float(c.importe_flete_cobro or 0),
            "Estado": c.estado
        })

    df = pd.DataFrame(datos)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Reporte General')
        
        for column in df:
            column_length = max(df[column].astype(str).map(len).max(), len(column))
            col_idx = df.columns.get_loc(column)
            writer.sheets['Reporte General'].column_dimensions[chr(65 + col_idx)].width = column_length + 2

    headers = {
        'Content-Disposition': 'attachment; filename="Reporte_General.xlsx"'
    }
    return Response(content=output.getvalue(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)


@router.get("/exportar/representante")
def exportar_excel_representante(skip: int = 0, limit: int = 10000, search: Optional[str] = None, localidad_id: Optional[int] = None, cliente_id: Optional[int] = None, tipo: Optional[str] = None, fecha_desde: Optional[date] = None, fecha_hasta: Optional[date] = None, estado: Optional[str] = None, db: Session = Depends(get_db)):
    
    resultado = crud_comprobante.get_comprobantes(db=db, skip=skip, limit=limit, search=search, localidad_id=localidad_id, cliente_id=cliente_id, tipo=tipo, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta, estado=estado)
    comprobantes = resultado["items"]
    
    if not comprobantes:
        raise HTTPException(status_code=404, detail="No hay comprobantes para exportar.")

    agrupados_por_localidad = {}
    
    for c in comprobantes:
        loc_nombre = c.localidad_destinatario_rel.nombre if c.localidad_destinatario_rel else "Sin Localidad"
        
        loc_nombre = loc_nombre[:31] 
        
        if loc_nombre not in agrupados_por_localidad:
            agrupados_por_localidad[loc_nombre] = []
            
        agrupados_por_localidad[loc_nombre].append({
            "Fecha": c.fecha_emision.strftime("%d/%m/%Y"),
            "N° Comprobante": c.numero_comprobante,
            "Remitente": c.nombre_remitente or (c.cliente.razon_social if c.cliente else "-"),
            "Destinatario": c.nombre_destinatario,
            "Localidad Origen": c.localidad_remitente_rel.nombre if c.localidad_remitente_rel else "-",
            "Bultos": c.cantidad_bultos,
            "Flete a Cobrar": float(c.importe_flete_cobro or 0),
            "Flete Neto": "",
            "Comisión": ""
        })

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        for localidad, datos in agrupados_por_localidad.items():
            df = pd.DataFrame(datos)
            df.to_excel(writer, index=False, sheet_name=localidad)
            
            for column in df:
                column_length = max(df[column].astype(str).map(len).max(), len(column))
                col_idx = df.columns.get_loc(column)
                writer.sheets[localidad].column_dimensions[chr(65 + col_idx)].width = column_length + 2

    headers = {
        'Content-Disposition': 'attachment; filename="Reporte_Representantes.xlsx"'
    }
    return Response(content=output.getvalue(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers=headers)

@router.get("/{comprobante_id}", response_model=ComprobanteResponse)
def get_comprobante(comprobante_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    comprobante = crud_comprobante.get_comprobante_by_id(db, comprobante_id)
    if not comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado.")
    return comprobante

@router.put("/{comprobante_id}", response_model=ComprobanteResponse)
def update_estado_comprobante(comprobante_id: int, comprobante_in: ComprobanteUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    db_comprobante = crud_comprobante.get_comprobante_by_id(db, comprobante_id)
    if not db_comprobante:
        raise HTTPException(status_code=404, detail="Comprobante no encontrado.")
    
    return crud_comprobante.update_comprobante_estado(db=db, db_comprobante=db_comprobante, comprobante_in=comprobante_in, usuario_id=current_user.id)