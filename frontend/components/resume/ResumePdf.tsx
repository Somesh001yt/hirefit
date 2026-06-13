import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { splitWithBold } from '@/lib/helpers';

export interface ResumeSection {
  role: string;
  org: string;
  location?: string;
  dates: string;
  bullets: string[];
}

export interface ResumeProject {
  name: string;
  tech: string;
  link?: string;
  bullets: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  experience: ResumeSection[];
  projects?: ResumeProject[];
  skills: string[];
  education: string;
}

const ACCENT = '#6366f1';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 10.5,
    color: '#1a1a1a',
    paddingTop: 42,
    paddingBottom: 40,
    paddingHorizontal: 46,
  },

  // ── Centered header ──
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  contactItem: { fontSize: 9.5, color: '#333' },
  contactSep: { fontSize: 9.5, color: '#999', marginHorizontal: 6 },

  // ── Section label — Helvetica-Bold small-caps style + titlerule ──
  sectionWrap: { marginTop: 9, marginBottom: 6 },
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#111',
    marginBottom: 3,
  },
  titlerule: {
    borderBottomWidth: 0.8,
    borderBottomColor: '#111',
    borderBottomStyle: 'solid',
  },

  // ── Subheading row (Company | Dates) ──
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 5,
  },
  subOrg: { fontFamily: 'Times-Bold', fontSize: 10.5 },
  subRight: { fontFamily: 'Times-Roman', fontSize: 9.5, color: '#444' },
  subTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  subRole: { fontFamily: 'Times-Italic', fontSize: 10, color: '#444' },
  subDates: { fontFamily: 'Times-Italic', fontSize: 9.5, color: '#444' },

  // ── Bullet list ──
  bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2, paddingLeft: 6 },
  bulletDot: { fontSize: 9, marginTop: 2, marginRight: 5, color: '#333' },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.5 },

  // ── Summary body ──
  bodyText: { fontSize: 10.5, lineHeight: 1.6 },

  // ── Skills: one line per category ──
  skillLine: { fontSize: 10, lineHeight: 1.65 },
  skillCat: { fontFamily: 'Times-Bold', fontSize: 10 },

  // ── Education ──
  eduText: { fontSize: 10.5, lineHeight: 1.55 },
});

// Section wrapper: Helvetica-Bold label + full-width rule (titlerule)
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.sectionWrap}>
      <Text style={s.sectionLabel}>{label}</Text>
      <View style={s.titlerule} />
      {children}
    </View>
  );
}

// Bold-black highlight: keywords + impact numbers, no colour
function HiText({ text, kw }: { text: string; kw: string[] }) {
  const segs = splitWithBold(text, kw);
  return (
    <Text>
      {segs.map((seg, i) =>
        seg.highlighted
          ? <Text key={i} style={{ fontFamily: 'Times-Bold', color: '#111' }}>{seg.text}</Text>
          : <Text key={i}>{seg.text}</Text>
      )}
    </Text>
  );
}

// Bullet item
function Bullet({ text, kw }: { text: string; kw: string[] }) {
  return (
    <View style={s.bullet}>
      <Text style={s.bulletDot}>•</Text>
      <View style={s.bulletText}>
        <HiText text={text} kw={kw} />
      </View>
    </View>
  );
}

// Skills line: bold "Category:" prefix if skill contains a colon
function SkillLine({ text, kw }: { text: string; kw: string[] }) {
  const colon = text.indexOf(':');
  if (colon > 0 && colon < 30) {
    const cat = text.slice(0, colon + 1);
    const rest = text.slice(colon + 1);
    return (
      <Text style={s.skillLine}>
        <Text style={s.skillCat}>{cat}</Text>
        <HiText text={rest} kw={kw} />
      </Text>
    );
  }
  return (
    <Text style={s.skillLine}>
      <HiText text={text} kw={kw} />
    </Text>
  );
}

function ResumePdfDoc({ data, kw }: { data: ResumeData; kw: string[] }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <Text style={s.name}>{data.name}</Text>
        <View style={s.contactRow}>
          {data.contact.map((c, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {i > 0 && <Text style={s.contactSep}>|</Text>}
              <Text style={s.contactItem}>{c}</Text>
            </View>
          ))}
        </View>

        {/* ── Summary ── */}
        {!!data.summary && (
          <Section label="Summary">
            <View style={{ marginTop: 4 }}>
              <Text style={s.bodyText}>
                <HiText text={data.summary} kw={kw} />
              </Text>
            </View>
          </Section>
        )}

        {/* ── Experience ── */}
        {data.experience.length > 0 && (
          <Section label="Experience">
            {data.experience.map((job, i) => (
              <View key={i} style={{ marginBottom: i < data.experience.length - 1 ? 7 : 0 }}>
                <View style={s.subRow}>
                  <Text style={s.subOrg}>{job.org}</Text>
                  <Text style={s.subRight}>{job.location ?? ''}</Text>
                </View>
                <View style={s.subTitleRow}>
                  <Text style={s.subRole}>{job.role}</Text>
                  <Text style={s.subDates}>{job.dates}</Text>
                </View>
                {job.bullets.map((b, j) => <Bullet key={j} text={b} kw={kw} />)}
              </View>
            ))}
          </Section>
        )}

        {/* ── Projects ── */}
        {(data.projects ?? []).length > 0 && (
          <Section label="Projects">
            {(data.projects ?? []).map((proj, i) => (
              <View key={i} style={{ marginBottom: i < (data.projects ?? []).length - 1 ? 7 : 0 }}>
                <View style={s.subRow}>
                  <Text style={s.bodyText}>
                    <Text style={{ fontFamily: 'Times-Bold' }}>{proj.name}</Text>
                    <Text style={{ fontFamily: 'Times-Italic', color: '#555' }}> | {proj.tech}</Text>
                  </Text>
                  {proj.link ? <Text style={{ fontSize: 9.5, color: ACCENT }}>{proj.link}</Text> : null}
                </View>
                {proj.bullets.map((b, j) => <Bullet key={j} text={b} kw={kw} />)}
              </View>
            ))}
          </Section>
        )}

        {/* ── Technical Skills ── */}
        {data.skills.length > 0 && (
          <Section label="Technical Skills">
            <View style={{ marginTop: 3 }}>
              {data.skills.map((sk, i) => <SkillLine key={i} text={sk} kw={kw} />)}
            </View>
          </Section>
        )}

        {/* ── Education ── */}
        <Section label="Education">
          <View style={{ marginTop: 4 }}>
            <Text style={s.eduText}>{data.education}</Text>
          </View>
        </Section>

      </Page>
    </Document>
  );
}

export async function generateResumePdf(data: ResumeData, addedKeywords: string[] = []): Promise<Blob> {
  return pdf(<ResumePdfDoc data={data} kw={addedKeywords} />).toBlob();
}

export default ResumePdfDoc;
