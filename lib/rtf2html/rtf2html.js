//*[rtf2html.js]*************************[http://code.google.com/p/obremsdk/]*
//
// JavaScript: RTF to HTML Conversion
// Version 0.12
//
// Utilizes RtfParser found in rtf.js module.
//
//-[History]------------------------------------------------------------------
// 2007-09-24 by NeilO .... v0.12: Made part of ObremSDK.
// 2007-03-04 by NeilO .... Created.
//
// (C)opyright 2007++ by Neil C. Obremski;                     New BSD License
//***********************[http://www.opensource.org/licenses/bsd-license.php]*

//_[Rtf2Html()]_______________________________________________________________
//
// Highest-level conversion function and easiest to use.  Just call and you'll
// be returned a string of HTML text.
//
// txt .................... [ in] Rich text formatted (RTF) string.
// baseurl ................ [ in] Base URL for hyperlinks.
// out .................... [ in] Output object; will contain files to be
//                                                      written out.
// ver .................... [ in] Version.  Currently only 2 is supported.
//
function Rtf2Html(txt, baseurl, out, ver)
{
        var parser = new RtfParser(txt);

        if (null == ver)
                ver = 2;
        if (2 != ver)
                throw Error("HTML version " + ver + " not supported");

        parser.HandleDest(";rtf", Main_);
        parser.HandleDest("pn", Bullets_);
        parser.HandleDest("pntxtb", parser.HandleIgnore);
        parser.HandleDest("pntext", parser.HandleIgnore);
        parser.HandleDest(";rtf;object", Pkg_);
        parser.HandleDest(";rtf;object;objclass", parser.HandlePcData);
        parser.HandleDest(";rtf;object;objdata", PkgData_);
        parser.HandleDest(";rtf;object;result", parser.HandleIgnore);
        parser.HandleDest(";rtf;object;result;pict", parser.HandleIgnore);

        parser.Document(true).baseurl = baseurl;
        parser.Document(true).outo = out;

        return parser.Document().html;

        //-[Main_()]--------------------------------------------------------------
        //
        function Main_(t, s, i, o)
        {
                if (513 === t)
                {
                        o.newpara = true;
                        // create string-builder for HTML in this destination
                        o.html = o.doc.sbhtml = [ ];
                }
                else if (769 === t)
                {
                        EndPara_();

                        // build string and set it on main document
                        o.doc.html = o.html.join("");
                }

                var typ = RtfTkTyp(t);

                if (1 === typ)
                {
                        if (null != o.par_beg)
                        {
                                o.html.push(o.par_beg);
                                o.par_beg = null;
                        }
        
                        if (true == o.newpara)
                        {
                                o.lastpari = o.html.length;
                                o.newpara = false;
                                Img_("LEFT");
                        }
                        else
                        {
                                Img_();
                        }

                        o.html.push(esc_(RtfTkTxt(t, s, i)));
                        return;
                }
                else if (5 === typ)
                {
                        o.html.push(esc_(RtfTkChr(t, s, i)));
                        return;
                }

                var ctl = RtfTkCtl(t, s, i);
                var val = RtfTkVal(t);

                switch (ctl)
                {
                        case "pard":
                                EndPara_();
                                break;

                        case "tab":
                                o.html.push("&nbsp;&nbsp;&nbsp;&nbsp;");
                                break;

                        case "li":
                                if (o.bullets)
                                {
                                        // ignore when bullets are on
                                }
                                else if (0 != val)
                                {
                                        if (!o.indented)
                                        {
                                                o.html.push("<BLOCKQUOTE>");
                                                o.indented = true;
                                        }
                                }
                                else if (o.indented)
                                {
                                }
                                break;

                        case "f":
                                o.font = o.doc.fonts[val];
                                
                                //WScript.Echo("Selected Font " + val);
                                //WScript.Echo("Font Name: " + o.font.name + " (" + o.font.family + ")");
                                
                                if (o.font.name.match(/(courier|system|fixed)/i))
                                {
                                        if (!o.monofont)
                                        {
                                                o.monofont = true;
                                                o.html.push("<CODE>");
                                        }
                                }
                                else if (o.monofont)
                                {
                                        o.html.push("</CODE>");
                                        o.monofont = false;
                                }

                                break;

                        // font size
                        case "fs":

                                if (o.chgsz < 0)
                                {
                                        for ( ; o.chgsz < 0; o.chgsz++)
                                                o.html.push("</SMALL>");
                                }
                                else if (o.chgsz > 0)
                                {
                                        for ( ; o.chgsz > 0; o.chgsz--)
                                                o.html.push("</BIG>");
                                }                               

                                switch (val >> 1)
                                {
                                        case 12:
                                                o.chgsz = 1;
                                                o.html.push("<BIG>");
                                                break;
                                        case 10:
                                                break;
                                        case 8:
                                                o.chgsz = -1;
                                                o.html.push("<SMALL>");
                                                break;
                                }
                                break;
                        
                        case "line":
                                if (o.bullets)
                                {
                                        if (!o.bulletline)
                                                o.bulletline = true;
                                }

                                o.html.push("<BR>");
                                break;

                        case "par":
                                Img_("RIGHT");
                                o.newpara = true;
                                if (o.bullets)
                                {
                                        if (o.bulletline)
                                        {
                                                o.html.push("<BR>");
                                                o.bulletline = false;
                                        }
                                        o.html.push("</LI>");
                                        o.par_beg = "<LI>";
                                }
                                else if (null == o.par_end)
                                {
                                        o.html.push("<BR>");
                                }
                                else
                                {
                                        o.html.push(o.par_end);
                                        o.par_end = null;
                                }
                                break;
                        
                        case "qc":
                                o.center = true;
                                if (0 === val)
                                {
                                        o.center = false;
                                        o.html.push("</CENTER>");
                                }
                                else
                                {
                                        o.html.push("<CENTER>");
                                }
                                break;

                        case "b":
                                if (0 === val)
                                        o.html.push("</B>");
                                else
                                        o.html.push("<B>");
                                break;
                        case "i":
                                if (0 === val)
                                        o.html.push("</I>");
                                else
                                        o.html.push("<I>");
                                break;
                        case "u":
                                if (0 === val)
                                        o.html.push("</U>");
                                else
                                        o.html.push("<U>");
                                break;
                }

                // end of main (private helpers follow)

                function Img_(align)
                {
                        if (null != o.doc.limg)
                        {
                                var imgtag = "<IMG SRC=\"" + o.doc.baseurl + o.doc.limg.name +
                                        "\" HSPACE=\"5\" VSPACE=\"5\" " +
                                        (null == align ? "" : "ALIGN=\"" + align + "\"") + " />";

                                if ("RIGHT" == align && null != o.lastpari)
                                {
                                        o.html.splice(o.lastpari, 0, imgtag);
                                }
                                else
                                {
                                        o.html.push(imgtag);
                                }

                                o.doc.limg = null;
                        }
                }

                function EndPara_()
                {
                        Img_();
                        if (o.center)
                        {
                                o.html.push("</CENTER>");
                                o.center = false;
                        }
                        o.newpara = true;
                        o.bulletline = false;
                        o.par_beg = null;
                        if (o.chgsz < 0)
                        {
                                for ( ; o.chgsz < 0; o.chgsz++)
                                        o.html.push("</SMALL>");
                        }
                        else if (o.chgsz > 0)
                        {
                                for ( ; o.chgsz > 0; o.chgsz--)
                                        o.html.push("</BIG>");
                        }
                        if (o.monofont)
                        {
                                o.html.push("</CODE>");
                                o.monofont = false;
                        }
                        if (o.indented)
                        {
                                o.html.push("</BLOCKQUOTE>");
                                o.par_end = "";
                                o.indented = false;
                        }
                        if (o.bullets)
                        {
                                o.html.push("</UL>");
                                o.par_end = "";
                                o.bullets = false;
                        }
                }

                function esc_(s)
                {
                        return s.replace(/&/g, '&amp;')         // ampersands
                                        .replace(/</g, '&lt;')          // open bracket
                                        .replace(/>/g, '&gt;')          // close bracket
                                        .replace(/\"/g, '&quot;')       // quote
                                        .replace(/  /g, " &nbsp;")
                                        ;
                }
        }

        //-[Bullets_()]-----------------------------------------------------------
        function Bullets_(t, s, i, o)
        {
                if (513 === t)
                {
                        o.stk[o.stk.length-2].bullets = true;
                        o.stk[o.stk.length-2].html.push("<UL><LI>");
                }
        }

        //-[Pkg_()]---------------------------------------------------------------
        //
        function Pkg_(t, s, i, o)
        {
                if (513 === t)
                {
                        return;
                }
                else if (769 === t)
                {
                        return;
                }

                var ctl = RtfTkCtl(t, s, i);
                var val = RtfTkVal(t);

                switch (ctl)
                {
                        case null:
                                break;
                        case "objemb":
                                break;
                        case "objclass":
                                break;
                        case "objw":
                                break;
                        case "objh":
                                break;
                        default:
                                WScript.Echo("Unhandled CTL: " + ctl);
                }
        }

        //-[PkgData_()]-----------------------------------------------------------
        //
        function PkgData_(t, s, i, o)
        {
                if (769 === t)
                {
                        var pfrm = o.stk[o.stk.length - 2];

                        // output a package
                        if ("Package" == pfrm.objclass)
                        {
                                var start = o.pos + RtfTkLen(o.tok);
                                var end = i;
                                var pkg = RtfPkgOb(s, start, end);
                                for (var j = 0; j < pkg.items.length; j++)
                                {
                                        var item = pkg.items[j];
                                        if (null != o.doc.outo)
                                        {
                                                if (null == o.doc.outo.files)
                                                        o.doc.outo.files = [ item ];
                                                else
                                                        o.doc.outo.files.push(item);
                                        }

                                        if (item.name.match(/\.(gif|png|jpe?g)$/i))
                                        {
                                                o.doc.limg = item;
                                        }
                                        else
                                        {
                                                o.doc.sbhtml.push("{<A HREF=\"" + o.doc.baseurl +
                                                        pkg.items[j].name + "\">" + pkg.items[j].name + "</A>}");
                                        }
                                }
                        }
                }
        }


} // Rtf2Html