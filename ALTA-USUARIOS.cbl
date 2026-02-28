      *================================================================
      * PROGRAMA: ALTA-USUARIOS
      * DESCRIPCION: Sistema simple de alta de usuarios con archivo
      * AUTOR: Sistema CASA
      * FECHA: 2026-02-28
      *================================================================
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ALTA-USUARIOS.
       AUTHOR. SISTEMA-CASA.

      *================================================================
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           DECIMAL-POINT IS COMMA.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT ARCHIVO-USUARIOS
               ASSIGN TO "USUARIOS.DAT"
               ORGANIZATION IS LINE SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-FILE-STATUS.

      *================================================================
       DATA DIVISION.
       FILE SECTION.

       FD ARCHIVO-USUARIOS.
       01 REGISTRO-USUARIO.
           05 RU-ID-USUARIO        PIC 9(05).
           05 FILLER               PIC X(01) VALUE ",".
           05 RU-NOMBRE            PIC X(30).
           05 FILLER               PIC X(01) VALUE ",".
           05 RU-APELLIDO          PIC X(30).
           05 FILLER               PIC X(01) VALUE ",".
           05 RU-EMAIL             PIC X(40).
           05 FILLER               PIC X(01) VALUE ",".
           05 RU-TELEFONO          PIC X(15).
           05 FILLER               PIC X(01) VALUE ",".
           05 RU-FECHA-ALTA        PIC X(10).

      *================================================================
       WORKING-STORAGE SECTION.

       01 WS-FILE-STATUS           PIC XX VALUE SPACES.

       01 WS-DATOS-USUARIO.
           05 WS-ID                PIC 9(05) VALUE ZEROS.
           05 WS-NOMBRE            PIC X(30) VALUE SPACES.
           05 WS-APELLIDO          PIC X(30) VALUE SPACES.
           05 WS-EMAIL             PIC X(40) VALUE SPACES.
           05 WS-TELEFONO          PIC X(15) VALUE SPACES.
           05 WS-FECHA-ALTA        PIC X(10) VALUE SPACES.

       01 WS-OPCION                PIC 9(01) VALUE ZEROS.
       01 WS-CONTINUAR             PIC X(01) VALUE "S".
       01 WS-CONTEO-USUARIOS       PIC 9(05) VALUE ZEROS.

       01 WS-LINEA-SEPARADORA.
           05 FILLER PIC X(50) VALUE
               "==================================================".

      *================================================================
       PROCEDURE DIVISION.

       0000-INICIO.
           PERFORM 1000-MOSTRAR-MENU
           STOP RUN.

      *----------------------------------------------------------------
       1000-MOSTRAR-MENU.
           PERFORM UNTIL WS-OPCION = 4
               MOVE 0 TO WS-OPCION
               DISPLAY SPACE
               DISPLAY WS-LINEA-SEPARADORA
               DISPLAY "   SISTEMA DE ALTA DE USUARIOS"
               DISPLAY WS-LINEA-SEPARADORA
               DISPLAY "   1. DAR DE ALTA UN USUARIO"
               DISPLAY "   2. LISTAR TODOS LOS USUARIOS"
               DISPLAY "   3. BUSCAR USUARIO POR ID"
               DISPLAY "   4. SALIR"
               DISPLAY WS-LINEA-SEPARADORA
               DISPLAY "   INGRESE OPCION: " WITH NO ADVANCING
               ACCEPT WS-OPCION

               EVALUATE WS-OPCION
                   WHEN 1
                       PERFORM 2000-ALTA-USUARIO
                   WHEN 2
                       PERFORM 3000-LISTAR-USUARIOS
                   WHEN 3
                       PERFORM 4000-BUSCAR-USUARIO
                   WHEN 4
                       DISPLAY " "
                       DISPLAY "   HASTA LUEGO!"
                       DISPLAY " "
                   WHEN OTHER
                       DISPLAY "   OPCION INVALIDA. INTENTE NUEVAMENTE."
               END-EVALUATE
           END-PERFORM.

      *----------------------------------------------------------------
       2000-ALTA-USUARIO.
           DISPLAY " "
           DISPLAY WS-LINEA-SEPARADORA
           DISPLAY "   ALTA DE NUEVO USUARIO"
           DISPLAY WS-LINEA-SEPARADORA

           PERFORM 2100-OBTENER-PROXIMO-ID

           DISPLAY "   ID ASIGNADO: " WS-ID

           DISPLAY "   NOMBRE      : " WITH NO ADVANCING
           ACCEPT WS-NOMBRE

           DISPLAY "   APELLIDO    : " WITH NO ADVANCING
           ACCEPT WS-APELLIDO

           DISPLAY "   EMAIL       : " WITH NO ADVANCING
           ACCEPT WS-EMAIL

           DISPLAY "   TELEFONO    : " WITH NO ADVANCING
           ACCEPT WS-TELEFONO

           MOVE FUNCTION CURRENT-DATE(1:10) TO WS-FECHA-ALTA

           PERFORM 2200-GUARDAR-USUARIO

           DISPLAY " "
           DISPLAY "   USUARIO REGISTRADO EXITOSAMENTE!"
           DISPLAY "   ID: " WS-ID
           DISPLAY "   NOMBRE: " WS-NOMBRE " " WS-APELLIDO.

      *----------------------------------------------------------------
       2100-OBTENER-PROXIMO-ID.
           MOVE ZEROS TO WS-CONTEO-USUARIOS
           OPEN INPUT ARCHIVO-USUARIOS

           IF WS-FILE-STATUS = "00"
               PERFORM UNTIL WS-FILE-STATUS NOT = "00"
                   READ ARCHIVO-USUARIOS INTO REGISTRO-USUARIO
                       AT END
                           MOVE "10" TO WS-FILE-STATUS
                       NOT AT END
                           ADD 1 TO WS-CONTEO-USUARIOS
                           MOVE RU-ID-USUARIO TO WS-ID
                   END-READ
               END-PERFORM
               CLOSE ARCHIVO-USUARIOS
               ADD 1 TO WS-ID
           ELSE
               MOVE 1 TO WS-ID
           END-IF.

      *----------------------------------------------------------------
       2200-GUARDAR-USUARIO.
           OPEN EXTEND ARCHIVO-USUARIOS

           IF WS-FILE-STATUS NOT = "00"
               OPEN OUTPUT ARCHIVO-USUARIOS
           END-IF

           MOVE WS-ID       TO RU-ID-USUARIO
           MOVE WS-NOMBRE   TO RU-NOMBRE
           MOVE WS-APELLIDO TO RU-APELLIDO
           MOVE WS-EMAIL    TO RU-EMAIL
           MOVE WS-TELEFONO TO RU-TELEFONO
           MOVE WS-FECHA-ALTA TO RU-FECHA-ALTA

           WRITE REGISTRO-USUARIO

           CLOSE ARCHIVO-USUARIOS.

      *----------------------------------------------------------------
       3000-LISTAR-USUARIOS.
           DISPLAY " "
           DISPLAY WS-LINEA-SEPARADORA
           DISPLAY "   LISTA DE USUARIOS REGISTRADOS"
           DISPLAY WS-LINEA-SEPARADORA

           MOVE ZEROS TO WS-CONTEO-USUARIOS
           OPEN INPUT ARCHIVO-USUARIOS

           IF WS-FILE-STATUS NOT = "00"
               DISPLAY "   NO HAY USUARIOS REGISTRADOS AUN."
           ELSE
               PERFORM UNTIL WS-FILE-STATUS NOT = "00"
                   READ ARCHIVO-USUARIOS INTO REGISTRO-USUARIO
                       AT END
                           MOVE "10" TO WS-FILE-STATUS
                       NOT AT END
                           ADD 1 TO WS-CONTEO-USUARIOS
                           DISPLAY "   ID    : " RU-ID-USUARIO
                           DISPLAY "   NOMBRE: " RU-NOMBRE " "
                                   RU-APELLIDO
                           DISPLAY "   EMAIL : " RU-EMAIL
                           DISPLAY "   TEL   : " RU-TELEFONO
                           DISPLAY "   ALTA  : " RU-FECHA-ALTA
                           DISPLAY "   --------------------------------"
                   END-READ
               END-PERFORM
               CLOSE ARCHIVO-USUARIOS
               DISPLAY "   TOTAL USUARIOS: " WS-CONTEO-USUARIOS
           END-IF.

      *----------------------------------------------------------------
       4000-BUSCAR-USUARIO.
           DISPLAY " "
           DISPLAY WS-LINEA-SEPARADORA
           DISPLAY "   BUSCAR USUARIO POR ID"
           DISPLAY WS-LINEA-SEPARADORA
           DISPLAY "   INGRESE ID A BUSCAR: " WITH NO ADVANCING
           ACCEPT WS-ID

           OPEN INPUT ARCHIVO-USUARIOS

           IF WS-FILE-STATUS NOT = "00"
               DISPLAY "   NO HAY USUARIOS REGISTRADOS."
           ELSE
               MOVE "N" TO WS-CONTINUAR
               PERFORM UNTIL WS-FILE-STATUS NOT = "00"
                   READ ARCHIVO-USUARIOS INTO REGISTRO-USUARIO
                       AT END
                           MOVE "10" TO WS-FILE-STATUS
                       NOT AT END
                           IF RU-ID-USUARIO = WS-ID
                               MOVE "S" TO WS-CONTINUAR
                               DISPLAY "   USUARIO ENCONTRADO:"
                               DISPLAY "   ID    : " RU-ID-USUARIO
                               DISPLAY "   NOMBRE: " RU-NOMBRE " "
                                       RU-APELLIDO
                               DISPLAY "   EMAIL : " RU-EMAIL
                               DISPLAY "   TEL   : " RU-TELEFONO
                               DISPLAY "   ALTA  : " RU-FECHA-ALTA
                           END-IF
                   END-READ
               END-PERFORM
               CLOSE ARCHIVO-USUARIOS
               IF WS-CONTINUAR = "N"
                   DISPLAY "   USUARIO CON ID " WS-ID
                           " NO ENCONTRADO."
               END-IF
           END-IF.
