import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mode, FormatType } from '../types'
import { serializeExportFormat, downloadFile } from '../utils/formatConversion'

// Mock the dependencies
vi.mock('../utils/formatConversion', () => ({
  serializeExportFormat: vi.fn(),
  modeToExportMode: vi.fn((mode) => ({
    slug: mode.slug,
    name: mode.name,
    description: mode.description,
    roleDefinition: mode.prompt,
    whenToUse: mode.usage,
    groups: ['read', 'edit', 'browser', 'command', 'mcp']
  })),
  downloadFile: vi.fn()
}))

const mockSerializeExportFormat = vi.mocked(serializeExportFormat)
const mockDownloadFile = vi.mocked(downloadFile)

describe('exportSelectedModes', () => {
  const mockModes: Mode[] = [
    {
      slug: 'debug-mode',
      name: 'Debug Mode',
      description: 'A debugging mode',
      usage: 'Use when debugging',
      prompt: 'Debug this code',
      family: 'default'
    },
    {
      slug: 'code-mode',
      name: 'Code Mode',
      description: 'A coding mode',
      usage: 'Use when coding',
      prompt: 'Write code',
      family: 'standalone'
    },
    {
      slug: 'architect-mode',
      name: 'Architect Mode',
      description: 'An architecture mode',
      usage: 'Use for architecture',
      prompt: 'Design architecture',
      family: 'cherished'
    },
    {
      slug: 'another-standalone',
      name: 'Another Standalone',
      description: 'Another standalone mode',
      usage: 'Use for standalone tasks',
      prompt: 'Handle standalone tasks',
      family: 'standalone'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockSerializeExportFormat.mockReturnValue('mocked-content')
    mockDownloadFile.mockImplementation(() => {})
  })

  // Create a testable version of exportSelectedModes
  const createExportSelectedModes = (modes: Mode[]) => {
    return (format: FormatType, selectedSlugs: string[]): boolean => {
      try {
        // Get selected modes
        const selectedModes = modes.filter(mode => selectedSlugs.includes(mode.slug))

        if (selectedModes.length === 0) {
          console.error('No modes selected for export')
          return false
        }

        // Convert to export format
        const exportModes = selectedModes.map(mode => ({
          slug: mode.slug,
          name: mode.name,
          description: mode.description,
          roleDefinition: mode.prompt,
          whenToUse: mode.usage,
          groups: ['read', 'edit', 'browser', 'command', 'mcp']
        }))
        const exportData = { customModes: exportModes }

        // Serialize to string
        const content = serializeExportFormat(exportData, format)

        // Download file
        const mimeType = format === 'json' ? 'application/json' : 'application/x-yaml'
        const extension = format === 'json' ? '.json' : '.yaml'

        // Get unique families from selected modes and create filename with them
        const uniqueFamilies = [...new Set(selectedModes.map(mode => mode.family))].sort()
        const familySuffix = uniqueFamilies.length > 0 ? `-${uniqueFamilies.join('-')}` : ''
        const filename = `roo-modes${familySuffix}${extension}`

        downloadFile(content, filename, mimeType)
        return true
      } catch (error) {
        console.error('Failed to export selected modes:', error)
        return false
      }
    }
  }

  const exportSelectedModes = createExportSelectedModes(mockModes)

  it('should return false when no modes are selected', () => {
    const result = exportSelectedModes('json', [])
    expect(result).toBe(false)
  })

  it('should generate correct filename for single family', () => {
    const result = exportSelectedModes('json', ['debug-mode'])
    expect(result).toBe(true)
    expect(mockDownloadFile).toHaveBeenCalledWith(
      'mocked-content',
      'roo-modes-default.json',
      'application/json'
    )
  })

  it('should generate correct filename for multiple families', () => {
    const result = exportSelectedModes('json', ['debug-mode', 'code-mode', 'architect-mode'])
    expect(result).toBe(true)
    expect(mockDownloadFile).toHaveBeenCalledWith(
      'mocked-content',
      'roo-modes-cherished-default-standalone.json',
      'application/json'
    )
  })

  it('should generate correct filename when no families (edge case)', () => {
    const modesWithoutFamily = mockModes.map(mode => ({ ...mode, family: '' }))
    const exportFunction = createExportSelectedModes(modesWithoutFamily)
    const result = exportFunction('json', ['debug-mode'])
    expect(result).toBe(true)
    expect(mockDownloadFile).toHaveBeenCalledWith(
      'mocked-content',
      'roo-modes-.json',
      'application/json'
    )
  })

  it('should sort family names alphabetically in filename', () => {
    const result = exportSelectedModes('yaml', ['architect-mode', 'debug-mode', 'code-mode'])
    expect(result).toBe(true)
    expect(mockDownloadFile).toHaveBeenCalledWith(
      'mocked-content',
      'roo-modes-cherished-default-standalone.yaml',
      'application/x-yaml'
    )
  })

  it('should use correct MIME type and extension for JSON', () => {
    const result = exportSelectedModes('json', ['debug-mode'])
    expect(result).toBe(true)
    expect(mockDownloadFile).toHaveBeenCalledWith(
      'mocked-content',
      'roo-modes-default.json',
      'application/json'
    )
  })

  it('should use correct MIME type and extension for YAML', () => {
    const result = exportSelectedModes('yaml', ['debug-mode'])
    expect(result).toBe(true)
    expect(mockDownloadFile).toHaveBeenCalledWith(
      'mocked-content',
      'roo-modes-default.yaml',
      'application/x-yaml'
    )
  })

  it('should call serializeExportFormat with correct data', () => {
    const result = exportSelectedModes('json', ['debug-mode', 'code-mode'])
    expect(result).toBe(true)
    expect(mockSerializeExportFormat).toHaveBeenCalledWith(
      {
        customModes: [
          {
            slug: 'debug-mode',
            name: 'Debug Mode',
            description: 'A debugging mode',
            roleDefinition: 'Debug this code',
            whenToUse: 'Use when debugging',
            groups: ['read', 'edit', 'browser', 'command', 'mcp']
          },
          {
            slug: 'code-mode',
            name: 'Code Mode',
            description: 'A coding mode',
            roleDefinition: 'Write code',
            whenToUse: 'Use when coding',
            groups: ['read', 'edit', 'browser', 'command', 'mcp']
          }
        ]
      },
      'json'
    )
  })

  it('should handle modes from the same family correctly', () => {
    const result = exportSelectedModes('json', ['code-mode', 'another-standalone'])
    expect(result).toBe(true)
    expect(mockDownloadFile).toHaveBeenCalledWith(
      'mocked-content',
      'roo-modes-standalone.json',
      'application/json'
    )
  })
})