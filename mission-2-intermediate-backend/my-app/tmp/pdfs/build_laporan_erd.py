from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A3, A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    KeepTogether,
    LongTable,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "ERD_Database_ImTrack.md"
OUTPUT = ROOT / "output" / "pdf" / "Laporan_Mission_ERD_ImTrack.pdf"

NAVY = colors.HexColor("#14213D")
BLUE = colors.HexColor("#2563EB")
CYAN = colors.HexColor("#06B6D4")
TEAL = colors.HexColor("#0F766E")
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#5B6475")
PALE = colors.HexColor("#EEF4FF")
PALE2 = colors.HexColor("#F5F7FB")
LINE = colors.HexColor("#D7DFEA")
WHITE = colors.white


def register_fonts() -> None:
    candidates = [
        ("SegoeUI", r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\segoeuii.ttf"),
        ("Arial", r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\arialbd.ttf", r"C:\Windows\Fonts\ariali.ttf"),
    ]
    for family, regular, bold, italic in candidates:
        if Path(regular).exists() and Path(bold).exists():
            pdfmetrics.registerFont(TTFont(family, regular))
            pdfmetrics.registerFont(TTFont(f"{family}-Bold", bold))
            if Path(italic).exists():
                pdfmetrics.registerFont(TTFont(f"{family}-Italic", italic))
            else:
                pdfmetrics.registerFont(TTFont(f"{family}-Italic", regular))
            pdfmetrics.registerFontFamily(
                family,
                normal=family,
                bold=f"{family}-Bold",
                italic=f"{family}-Italic",
                boldItalic=f"{family}-Bold",
            )
            return family
    return "Helvetica"


FONT = register_fonts()
MONO = "Consolas" if Path(r"C:\Windows\Fonts\consola.ttf").exists() else "Courier"
if MONO == "Consolas":
    pdfmetrics.registerFont(TTFont("Consolas", r"C:\Windows\Fonts\consola.ttf"))


def sanitize(text: str) -> str:
    replacements = {
        "\u2014": " - ",
        "\u2013": "-",
        "\u2011": "-",
        "\u2212": "-",
        "\u2192": "->",
        "\u2194": "<->",
        "\u00d7": "x",
        "\u2260": "!=",
        "\u00a0": " ",
        "\u2502": "|",
        "\u251c": "+",
        "\u2514": "+",
        "\u2500": "-",
        "\u2190": "<-",
        "\u221e": "tak terbatas",
        "\u2076": "6",
        "\u2074": "4",
        "\u00b2": "2",
        "\u00b3": "3",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def inline_markup(text: str) -> str:
    text = sanitize(text.strip())
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", rf'<font name="{MONO}">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    return text


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="BodyUI", parent=styles["BodyText"], fontName=FONT, fontSize=9.2,
    leading=13.2, textColor=INK, alignment=TA_JUSTIFY, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="SmallUI", parent=styles["BodyText"], fontName=FONT, fontSize=7.7,
    leading=10.2, textColor=INK,
))
styles.add(ParagraphStyle(
    name="TableUI", parent=styles["BodyText"], fontName=FONT, fontSize=6.6,
    leading=8.5, textColor=INK,
))
styles.add(ParagraphStyle(
    name="TableHeadUI", parent=styles["BodyText"], fontName=f"{FONT}-Bold", fontSize=6.8,
    leading=8.8, textColor=WHITE, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="H1UI", parent=styles["Heading1"], fontName=f"{FONT}-Bold", fontSize=18,
    leading=22, textColor=NAVY, spaceBefore=10, spaceAfter=10, keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="H2UI", parent=styles["Heading2"], fontName=f"{FONT}-Bold", fontSize=12.5,
    leading=16, textColor=BLUE, spaceBefore=11, spaceAfter=6, keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="H3UI", parent=styles["Heading3"], fontName=f"{FONT}-Bold", fontSize=10.3,
    leading=13, textColor=TEAL, spaceBefore=9, spaceAfter=5, keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="CoverTitle", fontName=f"{FONT}-Bold", fontSize=29, leading=34,
    textColor=WHITE, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="CoverSub", fontName=FONT, fontSize=12.5, leading=18,
    textColor=colors.HexColor("#D9E7FF"), alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="CoverMeta", fontName=FONT, fontSize=9, leading=14,
    textColor=INK, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="Callout", fontName=FONT, fontSize=9.3, leading=13.4,
    textColor=NAVY, leftIndent=8, rightIndent=8, spaceBefore=4, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="CodeUI", fontName=MONO, fontSize=6.1, leading=7.7,
    textColor=colors.HexColor("#E5E7EB"), backColor=colors.HexColor("#111827"),
    borderPadding=7, spaceAfter=2,
))
styles.add(ParagraphStyle(
    name="TOC1UI", fontName=f"{FONT}-Bold", fontSize=10.5, leading=14,
    leftIndent=0, firstLineIndent=0, textColor=NAVY, spaceBefore=4,
))
styles.add(ParagraphStyle(
    name="TOC2UI", fontName=FONT, fontSize=9, leading=12,
    leftIndent=15, firstLineIndent=0, textColor=INK,
))
styles.add(ParagraphStyle(
    name="TOCTitleUI", parent=styles["H1UI"],
))


class MissionDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str):
        pw, ph = A4
        lw, lh = landscape(A3)
        cover_frame = Frame(0, 0, pw, ph, id="cover_frame", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        portrait_frame = Frame(17*mm, 18*mm, pw-34*mm, ph-35*mm, id="portrait_frame", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        landscape_frame = Frame(11*mm, 15*mm, lw-22*mm, lh-28*mm, id="landscape_frame", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        super().__init__(filename, pagesize=A4, leftMargin=17*mm, rightMargin=17*mm, topMargin=18*mm, bottomMargin=18*mm)
        self.addPageTemplates([
            PageTemplate(id="cover", pagesize=A4, frames=[cover_frame], onPage=self._cover_page),
            PageTemplate(id="portrait", pagesize=A4, frames=[portrait_frame], onPage=self._content_page),
            PageTemplate(id="landscape", pagesize=landscape(A3), frames=[landscape_frame], onPage=self._content_page_landscape),
        ])

    def _cover_page(self, canvas, doc):
        canvas.setPageSize(A4)
        canvas.setTitle("Laporan Mission ERD dan Desain Database ImTrack")
        canvas.setAuthor("Vincent")
        canvas.setSubject("Mission Node.JS - Entity Relationship Diagram dan Preparation Database")
        w, h = A4
        canvas.setFillColor(NAVY)
        canvas.rect(0, h*0.45, w, h*0.55, stroke=0, fill=1)
        canvas.setFillColor(BLUE)
        canvas.rect(0, h*0.45, 8*mm, h*0.55, stroke=0, fill=1)
        canvas.setFillColor(colors.HexColor("#E8F0FF"))
        canvas.circle(w-22*mm, h-18*mm, 30*mm, stroke=0, fill=1)
        canvas.setFillColor(colors.HexColor("#BFD3FF"))
        canvas.circle(w-22*mm, h-18*mm, 18*mm, stroke=0, fill=1)

    def _header_footer(self, canvas, page_size, label):
        w, h = page_size
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.5)
        canvas.line(14*mm, h-11*mm, w-14*mm, h-11*mm)
        canvas.setFont(f"{FONT}-Bold", 7.5)
        canvas.setFillColor(NAVY)
        canvas.drawString(14*mm, h-8*mm, "IMTRACK  /  DATABASE DESIGN REPORT")
        canvas.setFont(FONT, 7.2)
        canvas.setFillColor(MUTED)
        canvas.drawRightString(w-14*mm, h-8*mm, label)
        canvas.setStrokeColor(LINE)
        canvas.line(14*mm, 10*mm, w-14*mm, 10*mm)
        canvas.setFont(FONT, 7.2)
        canvas.drawString(14*mm, 6.5*mm, "Mission Node.JS - ERD & Preparation Database")
        canvas.drawRightString(w-14*mm, 6.5*mm, f"Halaman {canvas.getPageNumber()}")
        canvas.restoreState()

    def _content_page(self, canvas, doc):
        canvas.setPageSize(A4)
        self._header_footer(canvas, A4, "Laporan Teknis")

    def _content_page_landscape(self, canvas, doc):
        canvas.setPageSize(landscape(A3))
        self._header_footer(canvas, landscape(A3), "UML Entity Relationship Diagram")

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            style = flowable.style.name
            if style in ("H1UI", "H2UI"):
                level = 0 if style == "H1UI" else 1
                text = flowable.getPlainText()
                key = f"h{level}-{self.page}-{abs(hash(text))}"
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(text, key, level=level, closed=False)
                self.notify("TOCEntry", (level, text, self.page, key))


class CoverContent(Flowable):
    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        self.height = availHeight
        return availWidth, availHeight

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        title = Paragraph("LAPORAN DESAIN DATABASE", styles["CoverTitle"])
        title.wrapOn(c, w-44*mm, 60*mm)
        title.drawOn(c, 24*mm, h-95*mm)
        sub = Paragraph("Entity Relationship Diagram (ERD)<br/>dan Preparation Database - ImTrack", styles["CoverSub"])
        sub.wrapOn(c, w-48*mm, 35*mm)
        sub.drawOn(c, 24*mm, h-127*mm)

        c.setFillColor(CYAN)
        c.roundRect(24*mm, h-151*mm, 46*mm, 9*mm, 4.5*mm, stroke=0, fill=1)
        c.setFont(f"{FONT}-Bold", 7.5)
        c.setFillColor(NAVY)
        c.drawCentredString(47*mm, h-147.7*mm, "MISSION NODE.JS")

        c.setFillColor(INK)
        c.setFont(f"{FONT}-Bold", 10)
        c.drawString(24*mm, 91*mm, "Ringkasan dokumen")
        c.setFont(FONT, 8.8)
        c.setFillColor(MUTED)
        lines = [
            "Aplikasi        ImTrack - Task Management / Todo List",
            "Desain          9 tabel, 12 foreign key, relasi 1:N, M:N, dan 1:1",
            "Database        MySQL 8.x / MariaDB 10.6+, InnoDB, utf8mb4",
            "Penyusun        Vincent",
            "Tanggal         31 Agustus 2026",
        ]
        y = 81*mm
        for line in lines:
            c.drawString(24*mm, y, line)
            y -= 7*mm
        c.setStrokeColor(LINE)
        c.line(24*mm, 38*mm, w-24*mm, 38*mm)
        c.setFont(FONT, 7.7)
        c.setFillColor(MUTED)
        c.drawString(24*mm, 30*mm, "Disusun berdasarkan missionobject.md dan ERD_Database_ImTrack.md")


class ERDDiagram(Flowable):
    entities = {
        "users": ["+ user_id: BIGINT {PK}", "+ username: VARCHAR(50) {UQ}", "+ email: VARCHAR(255) {UQ}", "+ password_hash: VARCHAR(255)", "+ display_name: VARCHAR(100)?", "+ avatar_url: VARCHAR(500)?", "+ is_active: BOOLEAN", "+ created_at: DATETIME", "+ updated_at: DATETIME"],
        "tasks": ["+ task_id: BIGINT {PK}", "+ user_id: BIGINT {FK}", "+ recurrence_id: BIGINT? {FK}", "+ title: VARCHAR(300)", "+ priority: Priority", "+ status: TaskStatus", "+ due_date: DATE?", "+ category: VARCHAR(100)?", "+ is_recurring: BOOLEAN", "+ is_shared: BOOLEAN", "+ created_at: DATETIME", "+ updated_at: DATETIME", "+ deleted_at: DATETIME?"],
        "recurrences": ["+ recurrence_id: BIGINT {PK}", "+ recurrence_type: RecurrenceType", "+ interval_value: TINYINT", "+ day_of_week: TINYINT?", "+ day_of_month: TINYINT?", "+ start_date: DATE", "+ end_date: DATE?", "+ created_at: DATETIME"],
        "tags": ["+ tag_id: BIGINT {PK}", "+ user_id: BIGINT {FK}", "+ name: VARCHAR(50)", "+ color_hex: CHAR(7)?", "+ created_at: DATETIME", "--", "{UQ} user_id, name"],
        "task_tags": ["+ task_tag_id: BIGINT {PK}", "+ task_id: BIGINT {FK}", "+ tag_id: BIGINT {FK}", "+ created_at: DATETIME", "--", "{UQ} task_id, tag_id"],
        "notifications": ["+ notification_id: BIGINT {PK}", "+ user_id: BIGINT {FK}", "+ task_id: BIGINT? {FK}", "+ actor_id: BIGINT? {FK}", "+ message: VARCHAR(500)", "+ is_read: BOOLEAN", "+ notif_type: NotificationType", "+ created_at: DATETIME"],
        "groups": ["+ group_id: BIGINT {PK}", "+ owner_id: BIGINT {FK}", "+ name: VARCHAR(100)", "+ description: TEXT?", "+ created_at: DATETIME", "+ updated_at: DATETIME"],
        "user_groups": ["+ user_group_id: BIGINT {PK}", "+ user_id: BIGINT {FK}", "+ group_id: BIGINT {FK}", "+ role: GroupRole", "+ joined_at: DATETIME", "--", "{UQ} user_id, group_id"],
        "task_groups": ["+ task_group_id: BIGINT {PK}", "+ task_id: BIGINT {FK}", "+ group_id: BIGINT {FK}", "+ shared_at: DATETIME", "--", "{UQ} task_id, group_id"],
    }

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        self.height = min(availHeight, 690)
        return self.width, self.height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        title_h = 31
        gap_x, gap_y = 50, 24
        box_w = (w - 3*gap_x) / 4
        top_h, mid_h, bot_h = 207, 176, 155
        top_y = h - title_h - top_h
        mid_y = top_y - gap_y - mid_h
        bot_y = mid_y - gap_y - bot_h
        xs = [i * (box_w + gap_x) for i in range(4)]
        pos = {
            "tags": (xs[0], top_y, box_w, top_h),
            "task_tags": (xs[1], top_y, box_w, top_h),
            "tasks": (xs[2], top_y, box_w, top_h),
            "recurrences": (xs[3], top_y, box_w, top_h),
            "users": (xs[1], mid_y, box_w, mid_h),
            "notifications": (xs[3], mid_y, box_w, mid_h),
            "user_groups": (xs[0], bot_y, box_w, bot_h),
            "groups": (xs[1], bot_y, box_w, bot_h),
            "task_groups": (xs[2], bot_y, box_w, bot_h),
        }

        c.setFont(f"{FONT}-Bold", 9.2)
        c.setFillColor(NAVY)
        c.drawString(0, h-13, "UML notation: class compartments + association multiplicity")
        c.setFont(FONT, 7.5)
        c.setFillColor(MUTED)
        c.drawString(0, h-25, "PK = primary key  |  FK = foreign key  |  UQ = unique  |  ? = nullable")
        c.drawRightString(w, h-13, "Catatan: recurrence_id harus UNIQUE untuk menjamin multiplicity 0..1")

        def anchor(name, side, offset=0.5):
            x, y, bw, bh = pos[name]
            if side == "left": return (x, y + bh*offset)
            if side == "right": return (x+bw, y + bh*offset)
            if side == "top": return (x + bw*offset, y+bh)
            return (x + bw*offset, y)

        associations = []

        def add(points, label, mult_a, mult_b, label_at=None, a_at=None, b_at=None):
            associations.append((points, label, mult_a, mult_b, label_at, a_at, b_at))

        # Top-row association entities and recurrence.
        p1, p2 = anchor("tags", "right", .55), anchor("task_tags", "left", .55)
        add([p1, p2], "tag link", "1", "0..*", ((p1[0]+p2[0])/2-10, p1[1]+8), (p1[0]+4,p1[1]-11), (p2[0]-22,p2[1]-11))
        p1, p2 = anchor("task_tags", "right", .55), anchor("tasks", "left", .55)
        add([p1, p2], "task link", "0..*", "1", ((p1[0]+p2[0])/2-11, p1[1]+8), (p1[0]+4,p1[1]-11), (p2[0]-10,p2[1]-11))
        p1, p2 = anchor("tasks", "right", .68), anchor("recurrences", "left", .68)
        add([p1, p2], "schedule", "0..*", "0..1", ((p1[0]+p2[0])/2-12, p1[1]+8), (p1[0]+4,p1[1]-11), (p2[0]-24,p2[1]-11))

        # Relations in the gap between top and middle rows.
        lane1 = top_y - 7
        lane2 = top_y - 15
        p1, p2 = anchor("users", "top", .26), anchor("tags", "bottom", .72)
        add([p1, (p1[0],lane1), (p2[0],lane1), p2], "owns", "1", "0..*", ((p1[0]+p2[0])/2,lane1+5), (p1[0]+4,p1[1]+3), (p2[0]+4,p2[1]-10))
        p1, p2 = anchor("users", "top", .74), anchor("tasks", "bottom", .25)
        add([p1, (p1[0],lane2), (p2[0],lane2), p2], "creates", "1", "0..*", ((p1[0]+p2[0])/2,lane2-8), (p1[0]+4,p1[1]+3), (p2[0]+4,p2[1]-10))
        p1, p2 = anchor("tasks", "bottom", .78), anchor("notifications", "top", .48)
        add([p1, (p1[0],lane1), (p2[0],lane1), p2], "generates", "0..1", "0..*", ((p1[0]+p2[0])/2,lane1+5), (p1[0]-25,p1[1]-10), (p2[0]+4,p2[1]+3))

        # Two named UML associations from users to notifications.
        p1, p2 = anchor("users", "right", .66), anchor("notifications", "left", .66)
        mid_x = (p1[0]+p2[0])/2
        add([p1, (mid_x,p1[1]), (mid_x,p2[1]), p2], "recipient", "1", "0..*", (mid_x,p1[1]+8), (p1[0]+4,p1[1]+5), (p2[0]-22,p2[1]+5))
        p1, p2 = anchor("users", "right", .34), anchor("notifications", "left", .34)
        add([p1, (mid_x-14,p1[1]), (mid_x-14,p2[1]), p2], "actor", "0..1", "0..*", (mid_x-14,p1[1]-10), (p1[0]+4,p1[1]+5), (p2[0]-22,p2[1]+5))

        # Collaboration relationships around the bottom row.
        bottom_lane1 = mid_y - 7
        bottom_lane2 = mid_y - 15
        p1, p2 = anchor("users", "bottom", .24), anchor("user_groups", "top", .76)
        add([p1, (p1[0],bottom_lane1), (p2[0],bottom_lane1), p2], "membership", "1", "0..*", ((p1[0]+p2[0])/2,bottom_lane1+5), (p1[0]+4,p1[1]-10), (p2[0]+4,p2[1]+3))
        p1, p2 = anchor("users", "bottom", .52), anchor("groups", "top", .52)
        add([p1, p2], "owns", "1", "0..*", (p1[0]+31,(p1[1]+p2[1])/2), (p1[0]+4,p1[1]-10), (p2[0]+4,p2[1]+3))
        p1, p2 = anchor("groups", "left", .54), anchor("user_groups", "right", .54)
        add([p1, p2], "members", "1", "0..*", ((p1[0]+p2[0])/2-13,p1[1]+8), (p1[0]-10,p1[1]-11), (p2[0]+4,p2[1]-11))
        p1, p2 = anchor("tasks", "bottom", .52), anchor("task_groups", "top", .52)
        add([p1, (p1[0],bottom_lane2), (p2[0],bottom_lane2), p2], "shared task", "1", "0..*", (p1[0]+31,(p1[1]+p2[1])/2), (p1[0]+4,p1[1]-10), (p2[0]+4,p2[1]+3))
        p1, p2 = anchor("groups", "right", .54), anchor("task_groups", "left", .54)
        add([p1, p2], "task shares", "1", "0..*", ((p1[0]+p2[0])/2-15,p1[1]+8), (p1[0]+4,p1[1]-11), (p2[0]-22,p2[1]-11))

        # Draw all association lines behind class boxes.
        c.setStrokeColor(colors.HexColor("#6D89B6"))
        c.setLineWidth(1.25)
        for points, *_ in associations:
            path = c.beginPath()
            path.moveTo(*points[0])
            for point in points[1:]:
                path.lineTo(*point)
            c.drawPath(path, stroke=1, fill=0)

        # UML class boxes with stereotype, name, and attribute compartment.
        pivot = {"task_tags", "user_groups", "task_groups"}
        for name, (x, y, bw, bh) in pos.items():
            header = TEAL if name in pivot else NAVY
            c.setFillColor(WHITE)
            c.setStrokeColor(colors.HexColor("#8EA6CA"))
            c.setLineWidth(1.0)
            c.roundRect(x, y, bw, bh, 5, stroke=1, fill=1)
            c.setFillColor(header)
            c.roundRect(x, y+bh-39, bw, 39, 5, stroke=0, fill=1)
            c.rect(x, y+bh-39, bw, 6, stroke=0, fill=1)
            c.setFillColor(colors.HexColor("#D7E4FF") if name not in pivot else colors.HexColor("#C9F5EF"))
            c.setFont(FONT, 7.2)
            c.drawCentredString(x+bw/2, y+bh-12, "<<entity>>")
            c.setFillColor(WHITE)
            c.setFont(f"{FONT}-Bold", 11.2)
            c.drawCentredString(x+bw/2, y+bh-28, name)

            fields = self.entities[name]
            visible_count = len([f for f in fields if f != "--"])
            fs = min(8.0, max(6.7, (bh-49)/(visible_count*1.35)))
            leading = fs*1.36
            ty = y+bh-51
            for field in fields:
                if field == "--":
                    c.setStrokeColor(LINE)
                    c.setLineWidth(0.6)
                    c.line(x+8, ty+4, x+bw-8, ty+4)
                    ty -= 4
                    continue
                if "{PK}" in field:
                    c.setFillColor(colors.HexColor("#B45309"))
                    c.setFont(f"{FONT}-Bold", fs)
                elif "{FK}" in field:
                    c.setFillColor(BLUE)
                    c.setFont(f"{FONT}-Bold", fs)
                elif "{UQ}" in field:
                    c.setFillColor(TEAL)
                    c.setFont(f"{FONT}-Bold", fs)
                else:
                    c.setFillColor(INK)
                    c.setFont(MONO, fs)
                c.drawString(x+9, ty, field)
                ty -= leading

        # UML role labels and endpoint multiplicities are drawn last.
        for points, label, mult_a, mult_b, label_at, a_at, b_at in associations:
            for txt, at, bold in ((label, label_at, False), (mult_a, a_at, True), (mult_b, b_at, True)):
                if not at:
                    continue
                fs = 6.8 if bold else 6.4
                tw = pdfmetrics.stringWidth(txt, f"{FONT}-Bold" if bold else FONT, fs)
                c.setFillColor(colors.Color(1, 1, 1, alpha=.92))
                c.rect(at[0]-2, at[1]-2, tw+4, fs+4, stroke=0, fill=1)
                c.setFillColor(NAVY if bold else MUTED)
                c.setFont(f"{FONT}-Bold" if bold else FONT, fs)
                c.drawString(at[0], at[1], txt)


def make_table(rows, avail_width: float):
    n = len(rows[0])
    if n == 2:
        widths = [avail_width*0.34, avail_width*0.66]
    elif n == 3:
        widths = [avail_width*0.22, avail_width*0.25, avail_width*0.53]
    elif n == 4:
        widths = [avail_width*0.18, avail_width*0.18, avail_width*0.21, avail_width*0.43]
    else:
        widths = [avail_width/n] * n
    data = []
    for ridx, row in enumerate(rows):
        style = styles["TableHeadUI"] if ridx == 0 else styles["TableUI"]
        data.append([Paragraph(inline_markup(cell), style) for cell in row])
    table = LongTable(data, colWidths=widths, repeatRows=1, hAlign="LEFT", splitByRow=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE2]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def parse_table(lines, start):
    rows = []
    i = start
    while i < len(lines) and lines[i].lstrip().startswith("|"):
        raw = lines[i].strip().strip("|")
        cells = [c.strip() for c in raw.split("|")]
        if not all(re.fullmatch(r":?-{3,}:?", c.replace(" ", "")) for c in cells):
            rows.append(cells)
        i += 1
    return rows, i


def code_paragraphs(code_lines):
    result = []
    chunk = []
    for line in code_lines:
        chunk.append(line)
        if len(chunk) >= 46:
            txt = "<br/>".join(html.escape(sanitize(x)).replace(" ", "&nbsp;") for x in chunk)
            result.extend([Paragraph(txt, styles["CodeUI"]), Spacer(1, 2)])
            chunk = []
    if chunk:
        txt = "<br/>".join(html.escape(sanitize(x)).replace(" ", "&nbsp;") for x in chunk)
        result.append(Paragraph(txt, styles["CodeUI"]))
    return result


def rubric_section(avail_width):
    rows = [
        ["Komponen", "Bobot", "Cakupan laporan"],
        ["Entity Relationship Diagram", "80%", "Identifikasi 9 entitas, seluruh atribut, PK/FK, kardinalitas relasi, diagram ERD, dan struktur tabel."],
        ["Penjelasan indexing", "10%", "Primary, single, composite, serta unique index dijelaskan per tabel beserta tujuan lookup, join, filter, dan integritas data."],
        ["Penjelasan tipe data", "5%", "Alasan pemilihan BIGINT, TINYINT, VARCHAR, CHAR, TEXT, DATE, DATETIME, dan ENUM disertai pertimbangan kapasitas."],
        ["Naming convention", "5%", "snake_case, tabel plural, pola PK/FK, prefix is_, suffix _at, serta pola nama index dan constraint diterapkan konsisten."],
    ]
    return [
        Paragraph("Kesesuaian dengan Mission Objective", styles["H1UI"]),
        Paragraph("Laporan ini menerjemahkan kebutuhan mission menjadi desain basis data relasional yang dapat langsung dipakai sebagai panduan implementasi backend Node.JS.", styles["BodyUI"]),
        make_table(rows, avail_width),
        Spacer(1, 8),
        Paragraph("Hasil Utama", styles["H2UI"]),
        Paragraph("Desain menghasilkan 9 tabel yang dinormalisasi, 12 foreign key, tabel pivot untuk tiga relasi many-to-many, strategi indeks untuk pola query utama, serta DDL MySQL yang menggunakan InnoDB dan utf8mb4.", styles["Callout"]),
        Paragraph("Catatan Validasi Desain", styles["H2UI"]),
        Paragraph("Untuk menjamin relasi tasks-recurrences benar-benar one-to-one, kolom tasks.recurrence_id perlu UNIQUE. Tanpa constraint tersebut, struktur fisik mengizinkan beberapa task memakai recurrence yang sama. Selain itu, UNIQUE pada users.email dan users.username sudah membentuk indeks, sehingga indeks non-unique tambahan pada dua kolom tersebut tidak diperlukan. Catatan ini menjadi rekomendasi sebelum migrasi produksi.", styles["BodyUI"]),
        PageBreak(),
    ]


def markdown_story(md: str, avail_width: float):
    lines = md.splitlines()
    story = []
    i = 0
    in_code = False
    code_lang = ""
    code = []
    first_title_skipped = False
    para = []
    pending_diagram_heading = None

    def flush_para():
        nonlocal para
        if para:
            text = " ".join(x.strip() for x in para)
            story.append(Paragraph(inline_markup(text), styles["BodyUI"]))
            para = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if in_code:
            if stripped.startswith("```"):
                in_code = False
                if code_lang == "mermaid":
                    flush_para()
                    story.extend([
                        NextPageTemplate("landscape"), PageBreak(),
                        Paragraph(inline_markup(pending_diagram_heading or "3. Diagram ERD (Entity Relationship Diagram)"), styles["H1UI"]),
                        ERDDiagram(),
                        NextPageTemplate("portrait"), PageBreak(),
                    ])
                    pending_diagram_heading = None
                else:
                    story.extend(code_paragraphs(code))
                    story.append(Spacer(1, 6))
                code, code_lang = [], ""
            else:
                code.append(line)
            i += 1
            continue
        if stripped.startswith("```"):
            flush_para()
            in_code = True
            code_lang = stripped[3:].strip().lower()
            i += 1
            continue
        if stripped.startswith("# "):
            flush_para()
            if not first_title_skipped:
                first_title_skipped = True
            else:
                story.append(Paragraph(inline_markup(stripped[2:]), styles["H1UI"]))
            i += 1
            continue
        if stripped.startswith("## "):
            flush_para()
            heading = stripped[3:]
            if heading.startswith("3. Diagram ERD"):
                pending_diagram_heading = heading
            else:
                story.append(Paragraph(inline_markup(heading), styles["H1UI"]))
            i += 1
            continue
        if stripped.startswith("### "):
            flush_para()
            story.append(Paragraph(inline_markup(stripped[4:]), styles["H2UI"]))
            i += 1
            continue
        if stripped.startswith("#### "):
            flush_para()
            story.append(Paragraph(inline_markup(stripped[5:]), styles["H3UI"]))
            i += 1
            continue
        if stripped.startswith("|"):
            flush_para()
            rows, i = parse_table(lines, i)
            if rows:
                story.append(make_table(rows, avail_width))
                story.append(Spacer(1, 7))
            continue
        if stripped.startswith(">"):
            flush_para()
            q = stripped.lstrip("> ")
            story.append(Paragraph(inline_markup(q), styles["Callout"]))
            i += 1
            continue
        if re.match(r"^[-*]\s+", stripped):
            flush_para()
            item = re.sub(r"^[-*]\s+", "", stripped)
            story.append(Paragraph("- " + inline_markup(item), styles["BodyUI"]))
            i += 1
            continue
        if stripped in ("---", ""):
            flush_para()
            if stripped == "---":
                story.append(Spacer(1, 4))
            i += 1
            continue
        para.append(line)
        i += 1
    flush_para()
    return story


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    md = SOURCE.read_text(encoding="utf-8")
    avail_width = A4[0] - 34*mm
    story = [
        CoverContent(),
        NextPageTemplate("portrait"),
        PageBreak(),
        Paragraph("Daftar Isi", styles["TOCTitleUI"]),
    ]
    toc = TableOfContents()
    toc.levelStyles = [styles["TOC1UI"], styles["TOC2UI"]]
    story.extend([toc, PageBreak()])
    story.extend(rubric_section(avail_width))
    story.extend(markdown_story(md, avail_width))
    story.extend([
        Spacer(1, 10),
        Paragraph("Kesimpulan", styles["H1UI"]),
        Paragraph("Desain database ImTrack telah memenuhi seluruh komponen penilaian mission: struktur ERD lengkap, strategi indeks, justifikasi tipe data, naming convention, dan DDL persiapan database. Sebelum implementasi backend, dua rekomendasi validasi - UNIQUE untuk recurrence one-to-one dan penghapusan indeks duplikat pada kolom UNIQUE - perlu diterapkan agar skema konsisten dan efisien.", styles["BodyUI"]),
    ])
    doc = MissionDocTemplate(str(OUTPUT))
    doc.multiBuild(story)
    print(OUTPUT)


if __name__ == "__main__":
    build()
